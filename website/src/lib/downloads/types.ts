/** Shared, serialisable types for the download flow. */

export type PlatformId = "windows" | "macos" | "linux";

/** CPU architectures a build can be made for. */
export type Arch = "x64" | "arm64";

/** What a manifest entry declares: a specific CPU, or "universal" for builds that run on both. */
export type ArchTag = Arch | "universal";

export type PackageFormat = "exe" | "dmg" | "appimage" | "deb";

export type FileVariant = "installer" | "portable";

/** One downloadable file, as declared in public/downloads/manifest.json. */
export interface DownloadFile {
  /** Stable identifier used in the thanks-page URL: platform-arch-variant-format. */
  id: string;
  platform: PlatformId;
  arch: ArchTag;
  format: PackageFormat;
  variant: FileVariant;
  /** The file's name, for display. */
  name: string;
  /** "/downloads/<file>" for a file hosted with the site, or an https URL for one hosted elsewhere. */
  url: string;
  /** True when `url` points off this site. */
  external: boolean;
  /** Size in bytes, or null when not known. */
  size: number | null;
  /** Lowercase hex SHA-256, or null when the manifest doesn't give one. */
  sha256: string | null;
  /** The manifest's own pick when several files match one platform and CPU. */
  recommended: boolean;
}

export interface DownloadSet {
  /** Display version, without a leading "v". */
  version: string;
  /** ISO date or timestamp, or null. */
  releasedAt: string | null;
  /** Link to release notes, or null. */
  notesUrl: string | null;
  files: DownloadFile[];
}

/**
 * The download page has exactly two honest states: there are files to offer,
 * or nothing has been published yet. (A broken manifest fails the build
 * instead, so a mistake can never reach visitors.)
 */
export type DownloadsResult = { status: "ready"; downloads: DownloadSet } | { status: "empty" };
