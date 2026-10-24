import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { gettingStarted } from "@/config/site";

export function GettingStarted() {
  return (
    <section id="get-started" aria-labelledby="get-started-title" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading id="get-started-title" eyebrow="Getting started" title="From download to first word in three steps" />

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {gettingStarted.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 100} className="relative">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="font-serif text-5xl leading-none tracking-tight text-accent">
                  {index + 1}
                </span>
                <span aria-hidden="true" className="hidden h-px flex-1 bg-line md:block" />
              </div>
              <h3 className="mt-5 font-serif text-xl tracking-tight">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 max-w-sm text-[0.9375rem] text-pretty text-ink-soft">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
