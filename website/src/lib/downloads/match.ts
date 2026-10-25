/**
 * Choosing the right file for a visitor.
 *
 * The manifest states each file's platform and CPU outright, so nothing here is
 * inferred from file names. The only uncertainty is the *visitor's* CPU, which a
 * browser often can't reveal. When it can't be known and the choice would
 * matter, no file is recommended and the visitor is asked, never guessed for.
 */

import type { Arch, DownloadFile, PackageFormat, PlatformId } from "./types";

/** Preferred order of formats per platform (first is preferred). */
export const FORMAT_ORDER: Readonly<Record<PlatformId, readonly PackageFormat[]>> = {
  windows: ["exe"],
  macos: ["dmg"],
  linux: ["appimage", "deb"],
};

export interface PlatformMatch {
  platform: PlatformId;
  /** The single best file, or null when the visitor has to choose. */
  recommended: DownloadFile | null;
  /** Every file for the platform, best first. Includes `recommended`. */
  files: DownloadFile[];
}

function fits(file: DownloadFile, arch: Arch): boolean {
  return file.arch === arch || file.arch === "universal";
}

function formatRank(file: DownloadFile): number {
  const rank = FORMAT_ORDER[file.platform].indexOf(file.format);
  return rank === -1 ? 99 : rank;
}

/** Orders candidates: the manifest's own pick, then installers, an exact CPU over "universal", then format. */
function rank(a: DownloadFile, b: DownloadFile, arch: Arch | null): number {
  if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
  if (a.variant !== b.variant) return a.variant === "installer" ? -1 : 1;
  if (arch) {
    const exact = (file: DownloadFile) => (file.arch === arch ? 0 : 1);
    if (exact(a) !== exact(b)) return exact(a) - exact(b);
  }
  const byFormat = formatRank(a) - formatRank(b);
  if (byFormat !== 0) return byFormat;
  return a.name.localeCompare(b.name);
}

export function matchFiles(files: readonly DownloadFile[], platform: PlatformId, detectedArch: Arch | null): PlatformMatch {
  const forPlatform = files.filter((file) => file.platform === platform);
  const sorted = [...forPlatform].sort((a, b) => rank(a, b, detectedArch));

  let recommended: DownloadFile | null = null;
  if (detectedArch) {
    // Known CPU: the best file that runs on it.
    recommended = sorted.find((file) => fits(file, detectedArch)) ?? null;
  } else {
    // Unknown CPU: recommend only what is safe whatever the CPU is.
    const installers = sorted.filter((file) => file.variant === "installer");
    const pool = installers.length > 0 ? installers : sorted;
    const universal = pool.find((file) => file.arch === "universal");
    const distinctArchs = new Set(pool.map((file) => file.arch));
    if (universal) recommended = universal;
    else if (distinctArchs.size === 1) recommended = pool[0] ?? null;
  }

  // The recommendation leads; everything else keeps its order.
  const ordered = recommended ? [recommended, ...sorted.filter((file) => file !== recommended)] : sorted;
  return { platform, recommended, files: ordered };
}

/* ----------------------------- display helpers ----------------------------- */

export function describeFormat(file: DownloadFile): string {
  switch (file.format) {
    case "exe":
      return file.variant === "portable" ? "Portable (.exe)" : "Installer (.exe)";
    case "dmg":
      return "Disk image (.dmg)";
    case "appimage":
      return "AppImage";
    case "deb":
      return "Debian package (.deb)";
  }
}

export function describeArch(file: DownloadFile): string {
  switch (file.arch) {
    case "arm64":
      return file.platform === "macos" ? "Apple silicon (arm64)" : "ARM64";
    case "x64":
      return file.platform === "macos" ? "Intel (x64)" : "x64";
    case "universal":
      return "Universal";
  }
}
