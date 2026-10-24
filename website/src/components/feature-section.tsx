import { CalmIcon, DesktopIcon, ExternalIcon, FreeIcon, OpenIcon, PageIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SpotCard } from "@/components/spot-card";
import { features, githubLinks, type FeatureIcon } from "@/config/site";

const ICONS: Record<FeatureIcon, typeof PageIcon> = {
  page: PageIcon,
  calm: CalmIcon,
  free: FreeIcon,
  desktop: DesktopIcon,
  open: OpenIcon,
};

/** Two wide cards, then three narrower ones, on a six-column grid. */
const SPANS = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"] as const;

export function FeatureSection() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          id="features-title"
          eyebrow="Features"
          title="Everything in service of the writing"
          intro="Quill keeps its promises small and its focus on the page."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {features.map((feature, index) => {
            const Icon = ICONS[feature.icon];
            return (
              <Reveal as="li" key={feature.id} delay={(index % 3) * 80} className={`${SPANS[index] ?? "lg:col-span-2"} ${index === 4 ? "sm:col-span-2" : ""}`}>
                <SpotCard className="h-full rounded-2xl border border-line bg-surface p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong sm:p-7">
                  <div className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-bg text-accent">
                    <Icon className="size-[1.4rem]" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-[0.9375rem] text-pretty text-ink-soft">{feature.description}</p>
                  {feature.linkToSource && githubLinks && (
                    <a href={githubLinks.repo} target="_blank" rel="noopener noreferrer" className="link mt-4 inline-flex items-center gap-1.5 text-[0.9375rem]">
                      View the source
                      <ExternalIcon className="size-3.5" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  )}
                </SpotCard>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
