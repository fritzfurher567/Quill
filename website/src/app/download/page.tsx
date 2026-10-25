import type { Metadata } from "next";
import { DownloadPicker } from "@/components/download-picker";
import { InkSpiral } from "@/components/ink-spiral";
import { Footer } from "@/components/footer";
import { Notice } from "@/components/notice";
import { ExternalIcon } from "@/components/icons";
import { githubLinks, platformOrder, platforms, product, siteUrl } from "@/config/site";
import { loadDownloads } from "@/lib/downloads/load";

export const metadata: Metadata = {
  title: "Download",
  description: `Download ${product.name} for Windows, macOS or Linux. ${product.name} is free.`,
  // Only once the real domain is known, so no canonical URL is ever invented.
  ...(siteUrl ? { alternates: { canonical: "/download" } } : {}),
};


export default async function DownloadPage() {
  const result = await loadDownloads();
  const labels = platformOrder.map((id) => platforms[id].label);

  return (
    <>
      <main id="main" className="relative overflow-hidden pt-28 pb-24 sm:pt-36">
        <InkSpiral className="-top-32 -right-48 size-[34rem] opacity-[0.04] sm:size-[44rem] dark:opacity-[0.055]" />
        <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-8">
          <p className="text-sm font-medium tracking-wide text-muted uppercase">Download</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.08] tracking-tight text-balance sm:text-5xl">Download Quill</h1>
          <p className="mt-4 max-w-xl text-base text-pretty text-ink-soft sm:text-lg">
            Quill is free for {labels.slice(0, -1).join(", ")} and {labels.at(-1)}. Pick your system and we&rsquo;ll show you the file made for it.
          </p>

          <div className="mt-10">
            {result.status === "ready" ? (
              <DownloadPicker downloads={result.downloads} />
            ) : (
              <Notice
                title="The first download isn't published yet"
                actions={
                  githubLinks ? (
                    <a href={githubLinks.releases} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
                      Check the releases on GitHub
                      <ExternalIcon className="size-3.5" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : undefined
                }
              >
                <p>Installers will appear here as soon as they&rsquo;re added. Nothing is missing on your end.</p>
              </Notice>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
