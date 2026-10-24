/**
 * Test fixtures only. Filenames follow the patterns electron-builder produces
 * for Quill's packaging config (see ../../../package.json in the repo root).
 */
import type { GitHubAssetPayload, GitHubReleasePayload } from "./types";

export const OWNER = "example-owner";
export const REPO = "Quill";

export function asset(name: string, size = 80_000_000, overrides: Partial<GitHubAssetPayload> = {}): GitHubAssetPayload {
  return {
    name,
    size,
    state: "uploaded",
    browser_download_url: `https://github.com/${OWNER}/${REPO}/releases/download/v1.5.0/${encodeURIComponent(name)}`,
    ...overrides,
  };
}

export const FULL_ASSET_SET: GitHubAssetPayload[] = [
  asset("Quill-Setup-1.5.0.exe", 91_000_000),
  asset("Quill-1.5.0-portable.exe", 90_000_000),
  asset("Quill-1.5.0.dmg", 120_000_000),
  asset("Quill-1.5.0-arm64.dmg", 115_000_000),
  asset("Quill-1.5.0-mac.zip", 118_000_000),
  asset("Quill-1.5.0-arm64-mac.zip", 113_000_000),
  asset("Quill-1.5.0.AppImage", 105_000_000),
  asset("Quill-1.5.0-arm64.AppImage", 102_000_000),
  asset("quill_1.5.0_amd64.deb", 80_000_000),
  asset("Quill-Setup-1.5.0.exe.blockmap", 90_000),
  asset("latest.yml", 500),
  asset("latest-mac.yml", 500),
  asset("latest-linux.yml", 500),
];

export function release(overrides: Partial<GitHubReleasePayload> = {}): GitHubReleasePayload {
  return {
    tag_name: "v1.5.0",
    name: "Quill 1.5.0",
    draft: false,
    prerelease: false,
    published_at: "2026-10-01T12:00:00Z",
    html_url: `https://github.com/${OWNER}/${REPO}/releases/tag/v1.5.0`,
    assets: FULL_ASSET_SET,
    ...overrides,
  };
}

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}
