import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatedHeadline } from "@/components/animated-headline";
import { AutoDownload } from "@/components/auto-download";
import { Footer } from "@/components/footer";
import { InkSpiral } from "@/components/ink-spiral";
import { SetupGuide } from "@/components/setup-guide";
import { DOWNLOAD_PATH, platforms, product } from "@/config/site";
import { loadDownloads } from "@/lib/downloads/load";
import { formatBytes } from "@/lib/format";

/** One page per file in the manifest, built ahead of time. Anything else is a 404. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const result = await loadDownloads();
  return result.status === "ready" ? result.downloads.files.map((file) => ({ id: file.id })) : [];
}

export const metadata: Metadata = {
  title: `Thanks for downloading ${product.name}`,
  // A personal "thank you" page has no business in search results.
  robots: { index: false, follow: false },
  alternates: {},
};

export default async function ThanksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadDownloads();
  const file = result.status === "ready" ? result.downloads.files.find((candidate) => candidate.id === id) : undefined;
  if (!file) notFound();

  return (
    <>
      <main id="main">
        <section aria-labelledby="thanks-title" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
          <InkSpiral className="-top-24 left-1/2 size-[36rem] -translate-x-1/2 opacity-[0.07] sm:size-[52rem] dark:opacity-[0.09]" />
          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 text-center sm:px-8">
            <AnimatedHeadline id="thanks-title" text={`Thanks for downloading ${product.name}.`} />
            <p className="enter mt-6 max-w-xl text-base text-pretty text-ink-soft sm:text-lg" style={{ "--i": 4 } as React.CSSProperties}>
              Quill for {platforms[file.platform].label} is on its way. When it&rsquo;s finished, follow the steps below to set it up.
            </p>
            <div className="enter w-full" style={{ "--i": 5 } as React.CSSProperties}>
              <AutoDownload name={file.name} url={file.url} size={formatBytes(file.size)} />
            </div>
            <a href="#setup" className="link enter mt-8 text-sm" style={{ "--i": 6 } as React.CSSProperties}>
              Jump to the setup steps
            </a>
          </div>
        </section>

        <section id="setup" aria-labelledby="setup-title" className="scroll-mt-20 border-t border-line bg-surface/60 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
            <p className="text-sm font-medium tracking-wide text-muted uppercase">Setting up</p>
            <h2 id="setup-title" className="mt-3 font-serif text-3xl leading-[1.12] tracking-tight text-balance sm:text-4xl">
              Set up Quill, step by step
            </h2>
            <p className="mt-4 max-w-xl text-base text-pretty text-ink-soft">
              Pick your operating system. We&rsquo;ve opened the one you downloaded for.
            </p>
            <div className="mt-10">
              <SetupGuide file={{ platform: file.platform, format: file.format, variant: file.variant, name: file.name }} />
            </div>

            <p className="mt-12 text-sm text-muted">
              Downloaded the wrong file?{" "}
              <Link href={DOWNLOAD_PATH} className="link">
                Choose a different download
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
