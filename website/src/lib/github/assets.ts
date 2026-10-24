/**
 * Turning GitHub release assets into installers the site can offer.
 *
 * Rules that matter:
 * - Download URLs are only ever the `browser_download_url` GitHub returned, and
 *   only when it really points into this repository's releases. Nothing is
 *   assembled from guessed filenames.
 * - Architecture is read from the filename only when it says so. A name that
 *   says nothing is "not stated", never silently treated as x64 or arm64.
 * - Checksums, blockmaps, update manifests and archives are not installers and
 *   are dropped.
 */

import type {
  Arch,
  ArchTag,
  AssetVariant,
  GitHubAssetPayload,
  PackageFormat,
  PlatformId,
  ReleaseAsset,
} from "./types";

const EXTENSIONS: ReadonlyArray<{ pattern: RegExp; format: PackageFormat; platform: PlatformId }> = [
  { pattern: /\.exe$/i, format: "exe", platform: "windows" },
  { pattern: /\.dmg$/i, format: "dmg", platform: "macos" },
  { pattern: /\.appimage$/i, format: "appimage", platform: "linux" },
  { pattern: /\.deb$/i, format: "deb", platform: "linux" },
];

/** Preferred order of formats per platform (first is the one we recommend). */
export const FORMAT_ORDER: Readonly<Record<PlatformId, readonly PackageFormat[]>> = {
  windows: ["exe"],
  macos: ["dmg"],
  linux: ["appimage", "deb"],
};

/** Returns the architecture a filename states, "unsupported" for 32-bit builds. */
function archFromName(name: string): ArchTag | "unsupported" {
  const lower = name.toLowerCase();
  if (/universal/.test(lower)) return "universal";
  if (/arm64|aarch64/.test(lower)) return "arm64";
  if (/x86[_-]64|x64|amd64/.test(lower)) return "x64";
  if (/ia32|i[3-6]86|armv7l|armhf|(^|[^a-z0-9])x86([^a-z0-9]|$)/.test(lower)) return "unsupported";
  return null;
}

function isReleaseDownloadUrl(value: string, owner: string, repo: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      url.pathname.toLowerCase().startsWith(`/${owner}/${repo}/releases/download/`.toLowerCase())
    );
  } catch {
    return false;
  }
}

/** Classifies one raw GitHub asset. Returns null for anything we should not offer. */
export function classifyAsset(
  raw: GitHubAssetPayload,
  repository: { owner: string; name: string },
): ReleaseAsset | null {
  if (typeof raw.name !== "string" || raw.name === "") return null;
  if (typeof raw.browser_download_url !== "string") return null;
  if (raw.state !== undefined && raw.state !== "uploaded") return null;
  if (!isReleaseDownloadUrl(raw.browser_download_url, repository.owner, repository.name)) return null;

  const match = EXTENSIONS.find((entry) => entry.pattern.test(raw.name as string));
  if (!match) return null;

  const arch = archFromName(raw.name);
  if (arch === "unsupported") return null;

  const variant: AssetVariant = /portable/i.test(raw.name) ? "portable" : "installer";
  const size = typeof raw.size === "number" && Number.isFinite(raw.size) && raw.size >= 0 ? raw.size : null;

  return {
    name: raw.name,
    url: raw.browser_download_url,
    size,
    platform: match.platform,
    format: match.format,
    variant,
    arch,
  };
}

export interface PlatformMatch {
  platform: PlatformId;
  /** The single best file, or null when we cannot be sure which one fits. */
  recommended: ReleaseAsset | null;
  /** Every offered file for the platform, best first. Includes `recommended`. */
  assets: ReleaseAsset[];
}

function archScore(tag: ArchTag, detected: Arch | null): number {
  if (detected) {
    if (tag === detected) return 3;
    if (tag === "universal") return 2;
    if (tag === null) return 1;
    return 0;
  }
  if (tag === "universal") return 2;
  if (tag === null) return 1;
  return 0;
}

/**
 * Picks the installers for a platform. `detectedArch` is optional: when the CPU
 * is not known, a file is only recommended if there is exactly one sensible
 * choice, otherwise every file is listed and the visitor decides.
 */
export function matchAssets(assets: readonly ReleaseAsset[], platform: PlatformId, detectedArch: Arch | null): PlatformMatch {
  const formatOrder = FORMAT_ORDER[platform];
  const forPlatform = assets.filter((asset) => asset.platform === platform);

  const sorted = [...forPlatform].sort((a, b) => {
    if (a.variant !== b.variant) return a.variant === "installer" ? -1 : 1;
    const byArch = archScore(b.arch, detectedArch) - archScore(a.arch, detectedArch);
    if (byArch !== 0) return byArch;
    const byFormat = formatOrder.indexOf(a.format) - formatOrder.indexOf(b.format);
    if (byFormat !== 0) return byFormat;
    return a.name.localeCompare(b.name);
  });

  const installers = sorted.filter((asset) => asset.variant === "installer");
  let recommended: ReleaseAsset | null = null;

  if (detectedArch) {
    // Format outranks architecture score: a universally usable format (AppImage)
    // beats a distro-specific one (.deb) even when the latter names the CPU.
    // Within one format, the file whose name matches the CPU best wins.
    const compatible = installers.filter((asset) => archScore(asset.arch, detectedArch) > 0);
    compatible.sort((a, b) => {
      const byFormat = formatOrder.indexOf(a.format) - formatOrder.indexOf(b.format);
      if (byFormat !== 0) return byFormat;
      return archScore(b.arch, detectedArch) - archScore(a.arch, detectedArch);
    });
    recommended = compatible[0] ?? null;
  } else {
    // Unknown CPU: only recommend when there is exactly one installer in the preferred format.
    const preferred = formatOrder.find((format) => installers.some((asset) => asset.format === format));
    const candidates = installers.filter((asset) => asset.format === preferred);
    if (candidates.length === 1) recommended = candidates[0] ?? null;
  }

  // Keep the recommendation first so the list reads best-first.
  const ordered = recommended ? [recommended, ...sorted.filter((asset) => asset !== recommended)] : sorted;
  return { platform, recommended, assets: ordered };
}

/* ----------------------------- display helpers ----------------------------- */

export function describeFormat(asset: ReleaseAsset): string {
  switch (asset.format) {
    case "exe":
      return asset.variant === "portable" ? "Portable (.exe)" : "Installer (.exe)";
    case "dmg":
      return "Disk image (.dmg)";
    case "appimage":
      return "AppImage";
    case "deb":
      return "Debian package (.deb)";
  }
}

export function describeArch(asset: ReleaseAsset): string {
  switch (asset.arch) {
    case "arm64":
      return asset.platform === "macos" ? "Apple silicon (arm64)" : "ARM64";
    case "x64":
      return asset.platform === "macos" ? "Intel (x64)" : "x64";
    case "universal":
      return "Universal";
    case null:
      return "CPU not stated in filename";
  }
}
