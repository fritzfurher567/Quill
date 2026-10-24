import { ExternalIcon } from "@/components/icons";
import { formatReleaseDate } from "@/lib/format";
import type { StableRelease } from "@/lib/github/types";

interface ReleaseInfoProps {
  release: StableRelease;
  /** Label of the platform currently selected, if any. */
  platformLabel: string | null;
}

/** The facts about the current stable release, straight from GitHub's data. Nothing is filled in by guesswork. */
export function ReleaseInfo({ release, platformLabel }: ReleaseInfoProps) {
  const date = formatReleaseDate(release.publishedAt);
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:flex sm:gap-x-10">
        <div>
          <dt className="text-muted">Current stable version</dt>
          <dd className="mt-0.5 font-medium text-ink">{release.version}</dd>
        </div>
        {date && (
          <div>
            <dt className="text-muted">Released</dt>
            <dd className="mt-0.5 font-medium text-ink">{date}</dd>
          </div>
        )}
        {platformLabel && (
          <div>
            <dt className="text-muted">Platform</dt>
            <dd className="mt-0.5 font-medium text-ink">{platformLabel}</dd>
          </div>
        )}
      </dl>
      <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5 text-sm">
        Release notes
        <ExternalIcon className="size-3.5" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}
