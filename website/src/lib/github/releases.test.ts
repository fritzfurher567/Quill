import { describe, expect, it, vi } from "vitest";
import { jsonResponse, OWNER, REPO, release } from "./fixtures";
import { getLatestStableRelease, pickLatestStable } from "./releases";

const repository = `${OWNER}/${REPO}`;

function fetchReturning(response: Response | (() => Response)) {
  return vi.fn(async () => (typeof response === "function" ? response() : response)) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

describe("pickLatestStable", () => {
  it("ignores drafts and prereleases even when they are newer", () => {
    const picked = pickLatestStable([
      release({ tag_name: "v2.0.0-beta", prerelease: true, published_at: "2026-10-10T00:00:00Z" }),
      release({ tag_name: "v1.9.9", draft: true, published_at: "2026-10-09T00:00:00Z" }),
      release({ tag_name: "v1.5.0", published_at: "2026-10-01T00:00:00Z" }),
      release({ tag_name: "v1.4.0", published_at: "2026-09-01T00:00:00Z" }),
    ]);
    expect(picked?.tag_name).toBe("v1.5.0");
  });

  it("returns null when nothing is stable", () => {
    expect(pickLatestStable([release({ prerelease: true })])).toBeNull();
    expect(pickLatestStable([release({ published_at: null })])).toBeNull();
    expect(pickLatestStable([])).toBeNull();
  });
});

describe("getLatestStableRelease", () => {
  it("returns the latest stable release with its installers", async () => {
    const fetchImpl = fetchReturning(jsonResponse([release({ tag_name: "v1.6.0-rc1", prerelease: true, published_at: "2026-10-05T00:00:00Z" }), release()]));
    const result = await getLatestStableRelease({ repository, fetchImpl });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.release.tag).toBe("v1.5.0");
    expect(result.release.version).toBe("1.5.0");
    expect(result.release.publishedAt).toBe("2026-10-01T12:00:00Z");
    expect(result.release.htmlUrl).toBe(`https://github.com/${OWNER}/${REPO}/releases/tag/v1.5.0`);
    expect(result.release.assets.map((a) => a.platform).sort()).toEqual(["linux", "linux", "linux", "macos", "macos", "windows", "windows"]);
    expect(result.releasesUrl).toBe(`https://github.com/${OWNER}/${REPO}/releases`);
  });

  it("requests the release list of the configured repository", async () => {
    const fetchImpl = fetchReturning(jsonResponse([]));
    await getLatestStableRelease({ repository, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=30`);
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("sends a token only when one is supplied", async () => {
    const fetchImpl = fetchReturning(jsonResponse([]));
    await getLatestStableRelease({ repository, fetchImpl, token: "secret-token" });
    const [, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer secret-token");
  });

  it("reports no stable release when the repository only has prereleases or drafts", async () => {
    const onlyPrerelease = fetchReturning(jsonResponse([release({ tag_name: "v1.0-beta", prerelease: true, assets: [] })]));
    expect(await getLatestStableRelease({ repository, fetchImpl: onlyPrerelease })).toEqual({
      status: "no-stable-release",
      releasesUrl: `https://github.com/${OWNER}/${REPO}/releases`,
    });
    expect((await getLatestStableRelease({ repository, fetchImpl: fetchReturning(jsonResponse([])) })).status).toBe("no-stable-release");
  });

  it("returns a release with zero installers as ok so the UI can say no installer matches", async () => {
    const result = await getLatestStableRelease({ repository, fetchImpl: fetchReturning(jsonResponse([release({ assets: [] })])) });
    expect(result.status).toBe("ok");
    if (result.status === "ok") expect(result.release.assets).toEqual([]);
  });

  it("falls back to the repository's release URL when html_url is missing or foreign", async () => {
    const result = await getLatestStableRelease({
      repository,
      fetchImpl: fetchReturning(jsonResponse([release({ html_url: "https://evil.example/release" })])),
    });
    expect(result.status === "ok" && result.release.htmlUrl).toBe(`https://github.com/${OWNER}/${REPO}/releases/tag/v1.5.0`);
  });

  it("reports a missing or invalid repository setting without calling GitHub", async () => {
    const fetchImpl = fetchReturning(jsonResponse([]));
    expect(await getLatestStableRelease({ repository: "", fetchImpl })).toEqual({ status: "not-configured" });
    expect(await getLatestStableRelease({ repository: undefined, fetchImpl })).toEqual({ status: "not-configured" });
    expect(await getLatestStableRelease({ repository: "not-a-repo", fetchImpl })).toEqual({ status: "invalid-config", value: "not-a-repo" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("reports an unknown or private repository", async () => {
    const result = await getLatestStableRelease({ repository, fetchImpl: fetchReturning(jsonResponse({ message: "Not Found" }, { status: 404 })) });
    expect(result).toEqual({ status: "repo-not-found", repoUrl: `https://github.com/${OWNER}/${REPO}` });
  });

  it("reports rate limiting, with the reset time when GitHub provides it", async () => {
    const limited = fetchReturning(() =>
      jsonResponse({ message: "API rate limit exceeded" }, { status: 403, headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1790000000" } }),
    );
    expect(await getLatestStableRelease({ repository, fetchImpl: limited })).toEqual({
      status: "rate-limited",
      releasesUrl: `https://github.com/${OWNER}/${REPO}/releases`,
      resetAt: new Date(1_790_000_000 * 1000).toISOString(),
    });
    const tooMany = await getLatestStableRelease({ repository, fetchImpl: fetchReturning(() => jsonResponse({}, { status: 429 })) });
    expect(tooMany).toMatchObject({ status: "rate-limited", resetAt: null });
  });

  it("recognises rate limiting from GitHub's message even when the headers are missing", async () => {
    const message = "API rate limit exceeded for 203.0.113.7. (But here's the good news: Authenticated requests get a higher rate limit.)";
    const result = await getLatestStableRelease({ repository, fetchImpl: fetchReturning(() => jsonResponse({ message }, { status: 403 })) });
    expect(result).toMatchObject({ status: "rate-limited", resetAt: null });
  });

  it("treats other failures as unavailable, and says why", async () => {
    const server = await getLatestStableRelease({ repository, fetchImpl: fetchReturning(() => jsonResponse({}, { status: 503 })) });
    expect(server).toMatchObject({ status: "unavailable", reason: "server" });

    const network = await getLatestStableRelease({ repository, fetchImpl: vi.fn(async () => { throw new TypeError("fetch failed"); }) as unknown as typeof fetch });
    expect(network).toMatchObject({ status: "unavailable", reason: "network" });

    const forbidden = await getLatestStableRelease({ repository, fetchImpl: fetchReturning(() => jsonResponse({}, { status: 403 })) });
    expect(forbidden).toMatchObject({ status: "unavailable", reason: "invalid-response" });
  });

  it("survives malformed bodies", async () => {
    const notJson = await getLatestStableRelease({ repository, fetchImpl: fetchReturning(() => new Response("<html>oops</html>", { status: 200 })) });
    expect(notJson).toMatchObject({ status: "unavailable", reason: "invalid-response" });

    const notArray = await getLatestStableRelease({ repository, fetchImpl: fetchReturning(() => jsonResponse({ releases: [] })) });
    expect(notArray).toMatchObject({ status: "unavailable", reason: "invalid-response" });

    const noTag = await getLatestStableRelease({ repository, fetchImpl: fetchReturning(() => jsonResponse([release({ tag_name: undefined })])) });
    expect(noTag).toMatchObject({ status: "unavailable", reason: "invalid-response" });
  });
});
