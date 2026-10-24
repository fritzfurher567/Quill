import { loadLatestRelease } from "@/lib/release";

/**
 * Lets the page's "Check again" button re-run the release lookup after a
 * failure. The GitHub request stays on the server (the optional token is never
 * exposed), successful lookups come from Next's data cache, and the short CDN
 * cache below stops repeated clicks from hammering GitHub's rate limit.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await loadLatestRelease();
  return Response.json(result, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
