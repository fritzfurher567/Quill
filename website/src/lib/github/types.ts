/**
 * Shared types for release data. Everything here is plain, serialisable data so
 * it can be produced on the server and handed to client components untouched.
 */

export type PlatformId = "windows" | "macos" | "linux";

/** CPU architectures Quill's installers are named for. */
export type Arch = "x64" | "arm64";

/**
 * Architecture as stated by an installer's filename:
 * - a concrete `Arch` when the name says so,
 * - "universal" for builds that run on both,
 * - `null` when the filename does not say (we never guess from a missing token).
 */
export type ArchTag = Arch | "universal" | null;

export type PackageFormat = "exe" | "dmg" | "appimage" | "deb";

export type AssetVariant = "installer" | "portable";

/** An installer file that belongs to a stable release, ready to be offered. */
export interface ReleaseAsset {
  name: string;
  /** The `browser_download_url` returned by GitHub. Never assembled by hand. */
  url: string;
  /** Size in bytes, or null when GitHub did not report one. */
  size: number | null;
  platform: PlatformId;
  format: PackageFormat;
  variant: AssetVariant;
  arch: ArchTag;
}

export interface StableRelease {
  tag: string;
  /** Tag without a leading "v", e.g. "1.2.0". */
  version: string;
  name: string | null;
  /** ISO timestamp, or null when GitHub did not report one. */
  publishedAt: string | null;
  /** The real release page (release notes and every other download). */
  htmlUrl: string;
  /** Only files recognised as installers; checksums, blockmaps etc. are dropped. */
  assets: ReleaseAsset[];
}

/**
 * Every outcome of looking up the latest stable release. The UI renders one
 * truthful state per variant; there is deliberately no "fake success".
 */
export type ReleaseResult =
  | { status: "ok"; release: StableRelease; releasesUrl: string }
  /** NEXT_PUBLIC_GITHUB_REPO was set to an empty value. */
  | { status: "not-configured" }
  /** NEXT_PUBLIC_GITHUB_REPO is set but is not a valid "owner/name". */
  | { status: "invalid-config"; value: string }
  /** GitHub answered 404: the repository does not exist or is private. */
  | { status: "repo-not-found"; repoUrl: string }
  /** The repository exists but has no published, non-draft, non-prerelease release. */
  | { status: "no-stable-release"; releasesUrl: string }
  | { status: "rate-limited"; releasesUrl: string; resetAt: string | null }
  | { status: "unavailable"; releasesUrl: string; reason: "network" | "server" | "invalid-response" };

/** Raw shapes from the GitHub REST API (only the fields we read). */
export interface GitHubAssetPayload {
  name?: unknown;
  browser_download_url?: unknown;
  size?: unknown;
  state?: unknown;
}

export interface GitHubReleasePayload {
  tag_name?: unknown;
  name?: unknown;
  draft?: unknown;
  prerelease?: unknown;
  published_at?: unknown;
  html_url?: unknown;
  assets?: unknown;
}
