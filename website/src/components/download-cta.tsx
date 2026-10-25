import Link from "next/link";
import { DownloadIcon } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { DOWNLOAD_PATH, platformOrder, platforms } from "@/config/site";
import { formatReleaseDate } from "@/lib/format";
import type { DownloadsResult } from "@/lib/downloads/types";

/** The homepage's download band. The real choosing happens on the download page. */
export function DownloadCta({ result }: { result: DownloadsResult }) {
  const downloads = result.status === "ready" ? result.downloads : null;
  const date = downloads ? formatReleaseDate(downloads.releasedAt) : null;
  const labels = platformOrder.map((id) => platforms[id].label);

  return (
    <section id="download" aria-labelledby="download-title" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="rounded-3xl border border-line bg-surface px-6 py-12 text-center sm:px-12 sm:py-16">
          <SectionHeading
            id="download-title"
            eyebrow="Download"
            title="Ready when you are"
            intro={`Quill is free for ${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}. We'll point you to the right file for your computer.`}
            align="center"
          />
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link href={DOWNLOAD_PATH} className="btn btn-primary btn-lg">
              <DownloadIcon className="size-[1.1rem]" />
              Download Quill
            </Link>
            {downloads && (
              <p className="text-sm text-muted">
                Version {downloads.version}
                {date ? ` · Released ${date}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
