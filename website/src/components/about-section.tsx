import { ExternalIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { githubLinks } from "@/config/site";

/** Confirmed values only; no founding story, numbers or promises. */
const VALUES = [
  { term: "Free to use", detail: "No price, no account." },
  { term: "Open source", detail: "The code is public and MIT licensed." },
  { term: "On the desktop", detail: "Windows, macOS and Linux." },
] as const;

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-muted uppercase">About Quill</p>
          <h2 id="about-title" className="mt-3 font-serif text-3xl leading-[1.15] tracking-tight text-balance sm:text-4xl md:text-[2.75rem]">
            Quill exists to give writers a quieter, more focused place to write.
          </h2>
          <p className="mt-6 max-w-xl text-base text-pretty text-ink-soft sm:text-lg">
            It&rsquo;s a writing tool that stays out of the way, free for anyone to use and open for anyone to read. It runs on the computers writers already have.
          </p>
          {githubLinks && (
            <a href={githubLinks.repo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-8">
              Read the source on GitHub
              <ExternalIcon className="size-4" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </Reveal>

        <Reveal delay={120} className="self-center">
          <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {VALUES.map((value) => (
              <div key={value.term} className="px-6 py-5">
                <dt className="font-serif text-lg tracking-tight">{value.term}</dt>
                <dd className="mt-1 text-[0.9375rem] text-ink-soft">{value.detail}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
