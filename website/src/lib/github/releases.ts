/**
 * Looking up the latest *stable* Quill release on GitHub.
 *
 * GitHub's "latest release" endpoint is not relied on: instead the release list
 * is read and filtered here, so drafts and prereleases can never be offered as
 * the current version. This module is server-side logic with no UI in it, and
 * `fetch` is injectable so every outcome can be tested without the network.
 */

import { classifyAsset } from "./assets";
import { parseRepository, type RepositoryConfig } from "./repository";
import type { GitHubReleasePayload, ReleaseResult, StableRelease } from "./types";

export interface FetchOptions {
  /** Raw "owner/name" setting. Usually `process.env.NEXT_PUBLIC_GITHUB_REPO`. */
  repository: string | undefined | null;
  /** Optional server-side token to raise the anonymous rate limit. */
  token?: string | undefined;
  fetchImpl?: typeof fetch;
  /** Seconds Next.js may cache a successful response for. */
  revalidateSeconds?: number;
  timeoutMs?: number;
}

const API_BASE = "https://api.github.com";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGitHubUrl(value: unknown, owner: string, repo: string): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      url.pathname.toLowerCase().startsWith(`/${owner}/${repo}/`.toLowerCase())
    );
  } catch {
    return false;
  }
}

/** Reduces a GitHub release payload to the data the site needs, or null if unusable. */
export function toStableRelease(
  payload: GitHubReleasePayload,
  repository: Extract<RepositoryConfig, { status: "ok" }>,
): StableRelease | null {
  if (typeof payload.tag_name !== "string" || payload.tag_name === "") return null;

  const rawAssets = Array.isArray(payload.assets) ? payload.assets : [];
  const assets = rawAssets
    .filter(isRecord)
    .map((asset) => classifyAsset(asset, repository))
    .filter((asset): asset is NonNullable<typeof asset> => asset !== null);

  const tag = payload.tag_name;
  return {
    tag,
    version: tag.replace(/^v(?=\d)/i, ""),
    name: typeof payload.name === "string" && payload.name.trim() !== "" ? payload.name : null,
    publishedAt: typeof payload.published_at === "string" ? payload.published_at : null,
    htmlUrl: isGitHubUrl(payload.html_url, repository.owner, repository.name)
      ? payload.html_url
      : `${repository.url}/releases/tag/${encodeURIComponent(tag)}`,
    assets,
  };
}

/**
 * From a list of releases, the newest published release that is neither a draft
 * nor a prerelease.
 */
export function pickLatestStable(releases: readonly GitHubReleasePayload[]): GitHubReleasePayload | null {
  const stable = releases.filter(
    (release) =>
      release.draft !== true &&
      release.prerelease !== true &&
      typeof release.published_at === "string" &&
      !Number.isNaN(Date.parse(release.published_at)),
  );
  stable.sort((a, b) => Date.parse(b.published_at as string) - Date.parse(a.published_at as string));
  return stable[0] ?? null;
}

export async function getLatestStableRelease(options: FetchOptions): Promise<ReleaseResult> {
  const repository = parseRepository(options.repository);
  if (repository.status === "missing") return { status: "not-configured" };
  if (repository.status === "invalid") return { status: "invalid-config", value: repository.value };

  const { owner, name, url: repoUrl, releasesUrl } = repository;
  const doFetch = options.fetchImpl ?? fetch;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "quill-website",
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await doFetch(`${API_BASE}/repos/${owner}/${name}/releases?per_page=30`, {
      headers,
      signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
      next: { revalidate: options.revalidateSeconds ?? 900 },
    } as RequestInit);
  } catch {
    return { status: "unavailable", releasesUrl, reason: "network" };
  }

  if (response.status === 404) return { status: "repo-not-found", repoUrl };

  // GitHub signals rate limiting with 429, or 403 plus headers and/or a message.
  // Headers can be stripped by proxies, so the message body is checked as well.
  let rateLimited =
    response.status === 429 ||
    (response.status === 403 &&
      (response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after")));
  if (!rateLimited && response.status === 403) {
    try {
      const text = await response.clone().text();
      rateLimited = /rate limit/i.test(text);
    } catch {
      // Unreadable body: fall through to the generic failure below.
    }
  }
  if (rateLimited) {
    const reset = Number(response.headers.get("x-ratelimit-reset"));
    return {
      status: "rate-limited",
      releasesUrl,
      resetAt: Number.isFinite(reset) && reset > 0 ? new Date(reset * 1000).toISOString() : null,
    };
  }

  if (!response.ok) {
    return { status: "unavailable", releasesUrl, reason: response.status >= 500 ? "server" : "invalid-response" };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { status: "unavailable", releasesUrl, reason: "invalid-response" };
  }
  if (!Array.isArray(body)) return { status: "unavailable", releasesUrl, reason: "invalid-response" };

  const latest = pickLatestStable(body.filter(isRecord));
  if (!latest) return { status: "no-stable-release", releasesUrl };

  const release = toStableRelease(latest, repository);
  if (!release) return { status: "unavailable", releasesUrl, reason: "invalid-response" };

  return { status: "ok", release, releasesUrl };
}
