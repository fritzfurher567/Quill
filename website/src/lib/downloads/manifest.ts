/**
 * Reading and validating public/downloads/manifest.json.
 *
 * The manifest is written by hand, so validation is deliberately strict: every
 * problem is reported at once with the entry it belongs to, unknown keys are
 * rejected (they are almost always typos), and nothing is guessed. This is a
 * pure function with no file access; the file-existence check lives in load.ts.
 */

import type { ArchTag, DownloadFile, DownloadSet, FileVariant, PackageFormat, PlatformId } from "./types";

const PLATFORMS: readonly PlatformId[] = ["windows", "macos", "linux"];
const ARCHS: readonly ArchTag[] = ["x64", "arm64", "universal"];
const VARIANTS: readonly FileVariant[] = ["installer", "portable"];

const EXTENSIONS: ReadonlyArray<{ pattern: RegExp; format: PackageFormat; platform: PlatformId; label: string }> = [
  { pattern: /\.exe$/i, format: "exe", platform: "windows", label: ".exe" },
  { pattern: /\.dmg$/i, format: "dmg", platform: "macos", label: ".dmg" },
  { pattern: /\.appimage$/i, format: "appimage", platform: "linux", label: ".AppImage" },
  { pattern: /\.deb$/i, format: "deb", platform: "linux", label: ".deb" },
];

const TOP_LEVEL_KEYS = new Set(["version", "releasedAt", "notesUrl", "files"]);
const ENTRY_KEYS = new Set(["platform", "arch", "file", "url", "variant", "recommended", "size", "sha256"]);

export type ManifestParseResult =
  /** `downloads` is null when the manifest lists no files yet. */
  | { ok: true; downloads: DownloadSet | null }
  | { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function describe(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value) ?? String(value);
}

function parseHttpsUrl(value: unknown): URL | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/** The file name a local `file` or an external `url` ends in. */
function nameFromUrl(url: URL): string {
  const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

function isSafeFileName(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 200 &&
    !/[\\/\0]/.test(value) &&
    !value.startsWith(".") &&
    !value.includes("..") &&
    // Keeps URL-encoding predictable and avoids surprises on case-insensitive disks.
    /^[A-Za-z0-9._ ()+@,=-]+$/.test(value)
  );
}

export function parseManifest(input: unknown): ManifestParseResult {
  const errors: string[] = [];

  if (!isRecord(input)) return { ok: false, errors: ["The manifest must be a JSON object, like { \"version\": \"1.0.0\", \"files\": [ ... ] }."] };

  for (const key of Object.keys(input)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors.push(`Unknown top-level key "${key}". Allowed: ${[...TOP_LEVEL_KEYS].join(", ")}.`);
  }

  if (!Array.isArray(input.files)) {
    errors.push('"files" must be a list, e.g. "files": [] when nothing is published yet.');
    return { ok: false, errors };
  }
  if (input.files.length === 0) return errors.length ? { ok: false, errors } : { ok: true, downloads: null };

  /* ----- release-level fields ----- */
  let version = "";
  if (typeof input.version !== "string" || input.version.trim() === "" || input.version.length > 64) {
    errors.push('"version" is required (for example "1.0.0") when files are listed.');
  } else {
    version = input.version.trim().replace(/^v(?=\d)/i, "");
  }

  let releasedAt: string | null = null;
  if (input.releasedAt !== undefined) {
    if (typeof input.releasedAt !== "string" || Number.isNaN(Date.parse(input.releasedAt))) {
      errors.push(`"releasedAt" must be a date like "2026-10-25", got ${describe(input.releasedAt)}.`);
    } else {
      releasedAt = input.releasedAt;
    }
  }

  let notesUrl: string | null = null;
  if (input.notesUrl !== undefined) {
    const parsed = parseHttpsUrl(input.notesUrl);
    if (!parsed) errors.push(`"notesUrl" must be an https:// URL, got ${describe(input.notesUrl)}.`);
    else notesUrl = parsed.href;
  }

  /* ----- files ----- */
  const files: DownloadFile[] = [];
  const seenIds = new Map<string, number>();

  input.files.forEach((raw: unknown, index: number) => {
    const where = `files[${index}]`;
    const problems: string[] = [];

    if (!isRecord(raw)) {
      errors.push(`${where}: each file must be an object.`);
      return;
    }
    for (const key of Object.keys(raw)) {
      if (!ENTRY_KEYS.has(key)) problems.push(`unknown key "${key}" (allowed: ${[...ENTRY_KEYS].join(", ")})`);
    }

    const platform = PLATFORMS.find((value) => value === raw.platform);
    if (!platform) problems.push(`"platform" must be one of ${PLATFORMS.join(", ")}, got ${describe(raw.platform)}`);

    const arch = ARCHS.find((value) => value === raw.arch);
    if (!arch) problems.push(`"arch" must be one of ${ARCHS.join(", ")}, got ${describe(raw.arch)}`);

    let variant: FileVariant = "installer";
    if (raw.variant !== undefined) {
      const found = VARIANTS.find((value) => value === raw.variant);
      if (found) variant = found;
      else problems.push(`"variant" must be ${VARIANTS.join(" or ")}, got ${describe(raw.variant)}`);
    }

    if (raw.recommended !== undefined && typeof raw.recommended !== "boolean") problems.push('"recommended" must be true or false');
    if (raw.size !== undefined && !(typeof raw.size === "number" && Number.isInteger(raw.size) && raw.size > 0)) {
      problems.push('"size" must be a whole number of bytes');
    }
    let sha256: string | null = null;
    if (raw.sha256 !== undefined) {
      if (typeof raw.sha256 === "string" && /^[A-Fa-f0-9]{64}$/.test(raw.sha256)) sha256 = raw.sha256.toLowerCase();
      else problems.push('"sha256" must be 64 hexadecimal characters');
    }

    /* Exactly one of `file` (hosted with the site) or `url` (hosted elsewhere). */
    const hasFile = raw.file !== undefined;
    const hasUrl = raw.url !== undefined;
    let name = "";
    let url = "";
    let external = false;

    if (hasFile === hasUrl) {
      problems.push('give exactly one of "file" (a file in public/downloads) or "url" (an https:// link to a file hosted elsewhere)');
    } else if (hasFile) {
      if (typeof raw.file !== "string" || !isSafeFileName(raw.file)) {
        problems.push(`"file" must be a plain file name inside public/downloads (no folders), got ${describe(raw.file)}`);
      } else {
        name = raw.file;
        url = `/downloads/${encodeURIComponent(raw.file)}`;
      }
    } else {
      const parsed = parseHttpsUrl(raw.url);
      if (!parsed) problems.push(`"url" must be an https:// URL, got ${describe(raw.url)}`);
      else {
        name = nameFromUrl(parsed);
        url = parsed.href;
        external = true;
      }
    }

    /* The format comes from the file name; it must suit the platform. */
    let format: PackageFormat | null = null;
    if (name) {
      const match = EXTENSIONS.find((entry) => entry.pattern.test(name));
      if (!match) problems.push(`can't tell the format of "${name}"; supported endings are ${EXTENSIONS.map((entry) => entry.label).join(", ")}`);
      else if (platform && match.platform !== platform) problems.push(`"${name}" is a ${match.label} file, which doesn't belong to platform "${platform}"`);
      else format = match.format;
    }

    if (problems.length > 0 || !platform || !arch || !format) {
      for (const problem of problems) errors.push(`${where}: ${problem}.`);
      return;
    }

    const id = `${platform}-${arch}-${variant}-${format}`;
    const previous = seenIds.get(id);
    if (previous !== undefined) {
      errors.push(`${where}: duplicates files[${previous}] (same platform, arch, variant and format: ${id}). Only one file per combination is supported.`);
      return;
    }
    seenIds.set(id, index);

    files.push({
      id,
      platform,
      arch,
      format,
      variant,
      name,
      url,
      external,
      size: typeof raw.size === "number" ? raw.size : null,
      sha256,
      recommended: raw.recommended === true,
    });
  });

  /* Two "recommended" picks for the same platform and CPU would contradict each other. */
  const picks = new Map<string, string[]>();
  for (const file of files) {
    if (!file.recommended) continue;
    const key = `${file.platform} ${file.arch}`;
    picks.set(key, [...(picks.get(key) ?? []), file.name]);
  }
  for (const [key, names] of picks) {
    if (names.length > 1) errors.push(`More than one file is marked "recommended" for ${key}: ${names.join(", ")}. Mark only one.`);
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, downloads: { version, releasedAt, notesUrl, files } };
}
