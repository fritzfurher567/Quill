"use client";

import { useEffect, useState } from "react";
import { DownloadIcon, ExternalIcon, RefreshIcon } from "@/components/icons";
import { Notice } from "@/components/notice";
import { PlatformSelector } from "@/components/platform-selector";
import { ReleaseInfo } from "@/components/release-info";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { githubLinks, platforms } from "@/config/site";
import { formatBytes } from "@/lib/format";
import { describeArch, describeFormat, matchAssets } from "@/lib/github/assets";
import type { PlatformId, ReleaseAsset, ReleaseResult, StableRelease } from "@/lib/github/types";
import { detectPlatform, refineArchitecture, type Detection } from "@/lib/platform";

const STATUSES: ReadonlySet<string> = new Set([
  "ok",
  "not-configured",
  "invalid-config",
  "repo-not-found",
  "no-stable-release",
  "rate-limited",
  "unavailable",
]);

function isReleaseResult(value: unknown): value is ReleaseResult {
  return typeof value === "object" && value !== null && typeof (value as { status?: unknown }).status === "string" && STATUSES.has((value as { status: string }).status);
}

const isDevelopment = process.env.NODE_ENV !== "production";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
      {children}
      <ExternalIcon className="size-3.5" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function AssetMeta({ asset }: { asset: ReleaseAsset }) {
  const size = formatBytes(asset.size);
  return (
    <span className="text-sm text-muted">
      {describeFormat(asset)} · {describeArch(asset)}
      {size ? ` · ${size}` : ""}
    </span>
  );
}

/** The installers for one platform: a recommendation when we can be sure, otherwise an honest list. */
function PlatformDownloads({ release, platform, detection }: { release: StableRelease; platform: PlatformId; detection: Detection | null }) {
  const label = platforms[platform].label;
  const match = matchAssets(release.assets, platform, detection?.platform === platform ? detection.arch : null);

  if (match.assets.length === 0) {
    return (
      <Notice title={`This release has no installer for ${label}`}>
        <p>
          Version {release.version} doesn&rsquo;t include a {label} file. Another platform may be available above, and the release page lists everything that was published.
        </p>
        <p>
          <ExternalLink href={release.htmlUrl}>Open the release page</ExternalLink>
        </p>
      </Notice>
    );
  }

  const others = match.assets.filter((asset) => asset !== match.recommended);

  return (
    <div className="space-y-6">
      {match.recommended ? (
        <div className="rounded-xl border border-line-strong bg-bg p-5 sm:p-6">
          <p className="text-sm font-medium text-muted">Recommended for {label}</p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[0.9375rem] break-all text-ink">{match.recommended.name}</p>
              <AssetMeta asset={match.recommended} />
            </div>
            <a href={match.recommended.url} rel="noopener noreferrer" className="btn btn-primary btn-lg shrink-0">
              <DownloadIcon className="size-[1.1rem]" />
              Download for {label}
            </a>
          </div>
        </div>
      ) : (
        <Notice title={`Choose the ${label} build that fits your computer`}>
          <p>
            {others.length > 1
              ? "Browsers can't reliably tell which processor a computer has, so we won't guess. Pick the file that matches yours."
              : "This is the only file published for this platform."}
          </p>
        </Notice>
      )}

      {match.recommended && others.length > 0 && !detection?.arch && platform !== "windows" && (
        <p className="text-sm text-muted">
          Your browser can&rsquo;t reliably say which processor you have. If the file above is not the right one for your computer, choose another below.
        </p>
      )}

      {others.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted">{match.recommended ? `Other downloads for ${label}` : `Downloads for ${label}`}</h3>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
            {others.map((asset) => (
              <li key={asset.url}>
                <a href={asset.url} rel="noopener noreferrer" className="group flex min-h-14 flex-col justify-center gap-0.5 px-4 py-3 transition-colors hover:bg-bg sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="min-w-0">
                    <span className="block font-mono text-sm break-all text-ink">{asset.name}</span>
                    <AssetMeta asset={asset} />
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink">
                    <DownloadIcon className="size-4" />
                    Download
                    <span className="sr-only"> {asset.name}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-muted">
        Download didn&rsquo;t start? Get the file from the <ExternalLink href={release.htmlUrl}>release page</ExternalLink> instead.
      </p>
    </div>
  );
}

export function DownloadSection({ initial }: { initial: ReleaseResult }) {
  const [result, setResult] = useState<ReleaseResult>(initial);
  const [checking, setChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [choice, setChoice] = useState<PlatformId | null>(null);

  // Detection is a best guess from the browser; it runs once and never blocks a manual choice.
  useEffect(() => {
    let cancelled = false;
    refineArchitecture(navigator, detectPlatform(navigator)).then((value) => {
      if (!cancelled) setDetection(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const platform = choice ?? detection?.platform ?? null;

  async function checkAgain() {
    setChecking(true);
    setCheckFailed(false);
    try {
      const response = await fetch("/api/release", { headers: { Accept: "application/json" } });
      const body: unknown = await response.json();
      if (!response.ok || !isReleaseResult(body)) throw new Error("Unexpected response");
      setResult(body);
    } catch {
      setCheckFailed(true);
    } finally {
      setChecking(false);
    }
  }

  const releasesLink = githubLinks?.releases ?? null;
  const retry = (
    <button type="button" onClick={checkAgain} className="btn btn-secondary" disabled={checking}>
      <RefreshIcon className="size-4" />
      Check again
    </button>
  );

  let body: React.ReactNode;
  switch (result.status) {
    case "ok":
      body = (
        <div className="space-y-7">
          <ReleaseInfo release={result.release} platformLabel={platform ? platforms[platform].label : null} />
          {platform ? (
            <PlatformDownloads release={result.release} platform={platform} detection={detection} />
          ) : (
            <Notice title="Choose your operating system">
              <p>
                {detection?.mobile
                  ? "Quill is a desktop app, so open this page on your Windows, macOS or Linux computer. You can still pick a platform above to see its files."
                  : "Pick your platform above to see the installers in this release."}
              </p>
            </Notice>
          )}
        </div>
      );
      break;
    case "not-configured":
    case "invalid-config":
      body = (
        <Notice title="Downloads aren't available yet">
          <p>This website hasn&rsquo;t been connected to Quill&rsquo;s releases yet, so there is nothing to download from here right now.</p>
          {isDevelopment && (
            <p>
              Developer note: set <code className="font-mono text-sm">NEXT_PUBLIC_GITHUB_REPO</code> to <code className="font-mono text-sm">owner/name</code> in{" "}
              <code className="font-mono text-sm">.env.local</code>.
              {result.status === "invalid-config" ? ` The current value (“${result.value}”) isn't a valid repository.` : ""}
            </p>
          )}
        </Notice>
      );
      break;
    case "repo-not-found":
      body = (
        <Notice tone="problem" title="We couldn't find Quill's releases">
          <p>GitHub didn&rsquo;t return the repository this site points to. Downloads are unavailable until that is fixed.</p>
        </Notice>
      );
      break;
    case "no-stable-release":
      body = (
        <Notice title="There's no stable release yet">
          <p>Quill hasn&rsquo;t published a stable version so far, so there is no installer to offer here. Early test builds, if any exist, are on the releases page and may be unfinished.</p>
        </Notice>
      );
      break;
    case "rate-limited":
      body = (
        <Notice tone="problem" title="Release information is temporarily unavailable" actions={<>{retry}</>}>
          <p>GitHub is limiting requests right now, so we can&rsquo;t look up the latest version. Please try again in a little while.</p>
        </Notice>
      );
      break;
    case "unavailable":
      body = (
        <Notice tone="problem" title="Release information is temporarily unavailable" actions={<>{retry}</>}>
          <p>We couldn&rsquo;t reach GitHub to look up the latest version. This is usually brief, so try again shortly.</p>
        </Notice>
      );
      break;
  }

  const fallbackLink =
    result.status === "rate-limited" || result.status === "unavailable" || result.status === "no-stable-release"
      ? result.releasesUrl
      : result.status === "repo-not-found"
        ? result.repoUrl
        : releasesLink;

  return (
    <section id="download" aria-labelledby="download-title" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          id="download-title"
          eyebrow="Download"
          title="Get Quill, free"
          intro="Choose your operating system and download the installer made for it. There's no account to create and nothing to pay."
        />

        <Reveal delay={80} className="mt-10 max-w-3xl rounded-2xl border border-line bg-surface p-4 shadow-(--shadow) sm:p-7">
          <PlatformSelector value={platform} detected={detection?.platform ?? null} onChange={setChoice} />

          <div className="mt-6 border-t border-line pt-6 sm:mt-7 sm:pt-7" aria-live="polite" aria-busy={checking}>
            {checking ? (
              <p role="status" className="fade-up flex items-center gap-3 text-ink-soft">
                <span className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-ink" aria-hidden="true" />
                Checking for the latest release…
              </p>
            ) : (
              <>
                {body}
                {checkFailed && (
                  <p className="mt-4 text-sm text-ink-soft">We couldn&rsquo;t check again just now, so the information above may be out of date.</p>
                )}
              </>
            )}
          </div>

          {result.status !== "ok" && fallbackLink && !checking && (
            <p className="mt-5 text-sm text-muted">
              You can also browse <ExternalLink href={fallbackLink}>{result.status === "repo-not-found" ? "the Quill repository on GitHub" : "Quill's releases on GitHub"}</ExternalLink> directly.
            </p>
          )}
        </Reveal>

        <noscript>
          <p className="mt-6 max-w-3xl text-ink-soft">
            Downloads need JavaScript to pick the right file for you.
            {releasesLink ? (
              <>
                {" "}
                You can also get every installer from the{" "}
                <a className="link" href={releasesLink} rel="noopener noreferrer">
                  releases page
                </a>
                .
              </>
            ) : null}
          </p>
        </noscript>
      </div>
    </section>
  );
}
