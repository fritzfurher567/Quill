/**
 * Server-side entry point for release data. Reads configuration from the
 * environment, so it must only be imported from server code (pages, route
 * handlers). The optional GITHUB_TOKEN never leaves the server.
 */

import { repositorySetting } from "@/config/site";
import { getLatestStableRelease } from "@/lib/github/releases";
import type { ReleaseResult } from "@/lib/github/types";

/** Seconds a successful lookup is cached; failures are retried on the next request. */
export const RELEASE_REVALIDATE_SECONDS = 900;

export function loadLatestRelease(): Promise<ReleaseResult> {
  return getLatestStableRelease({
    repository: repositorySetting,
    token: process.env.GITHUB_TOKEN || undefined,
    revalidateSeconds: RELEASE_REVALIDATE_SECONDS,
  });
}
