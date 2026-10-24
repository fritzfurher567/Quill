/**
 * Parsing and validation of the configured GitHub repository.
 *
 * The value comes from NEXT_PUBLIC_GITHUB_REPO ("owner/name"). Validation is
 * strict on purpose: the result is interpolated into API URLs and links, so
 * only characters GitHub itself allows are accepted.
 */

export type RepositoryConfig =
  | {
      status: "ok";
      owner: string;
      name: string;
      /** https://github.com/owner/name */
      url: string;
      /** https://github.com/owner/name/releases */
      releasesUrl: string;
    }
  | { status: "missing" }
  | { status: "invalid"; value: string };

const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const NAME_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

export function parseRepository(raw: string | undefined | null): RepositoryConfig {
  const value = (raw ?? "").trim();
  if (value === "") return { status: "missing" };

  // Accept "owner/name" or a pasted github.com URL (with optional .git suffix).
  const stripped = value
    .replace(/^https:\/\/github\.com\//i, "")
    .replace(/\/+$/, "")
    .replace(/\.git$/i, "");

  const parts = stripped.split("/");
  if (parts.length !== 2) return { status: "invalid", value };

  const [owner, name] = parts as [string, string];
  const nameIsSafe = NAME_PATTERN.test(name) && name !== "." && name !== "..";
  if (!OWNER_PATTERN.test(owner) || !nameIsSafe) return { status: "invalid", value };

  const url = `https://github.com/${owner}/${name}`;
  return { status: "ok", owner, name, url, releasesUrl: `${url}/releases` };
}

/**
 * Validates the optional production origin. Returns null unless it is a real
 * http(s) origin, so no canonical URL is ever emitted for a guessed domain.
 */
export function parseSiteUrl(raw: string | undefined | null): URL | null {
  const value = (raw ?? "").trim();
  if (value === "") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return new URL(url.origin);
  } catch {
    return null;
  }
}
