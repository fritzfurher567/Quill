import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { platformOrder, platforms, requirementsNote } from "@/config/site";

export function SystemRequirements() {
  return (
    <section id="requirements" aria-labelledby="requirements-title" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          id="requirements-title"
          eyebrow="System requirements"
          title="Where Quill runs"
          intro="Quill is built for the three major desktop platforms."
        />

        <Reveal delay={80} className="mt-10">
          {/* Focusable so keyboard users can scroll the table sideways on narrow screens. */}
          <div
            role="region"
            aria-label="Supported platforms table"
            tabIndex={0}
            className="overflow-x-auto rounded-2xl border border-line bg-surface focus-visible:outline-offset-4"
          >
            <table className="w-full min-w-[34rem] border-collapse text-left text-[0.9375rem]">
              <caption className="sr-only">Supported platforms, their installer formats and processor builds</caption>
              <thead>
                <tr className="border-b border-line text-sm text-muted">
                  <th scope="col" className="px-5 py-3.5 font-medium sm:px-6">Platform</th>
                  <th scope="col" className="px-5 py-3.5 font-medium sm:px-6">Installer</th>
                  <th scope="col" className="px-5 py-3.5 font-medium sm:px-6">Processor builds</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {platformOrder.map((id) => (
                  <tr key={id}>
                    <th scope="row" className="px-5 py-4 font-serif text-lg font-normal tracking-tight sm:px-6">{platforms[id].label}</th>
                    <td className="px-5 py-4 text-ink-soft sm:px-6">{platforms[id].installerSummary}</td>
                    <td className="px-5 py-4 text-ink-soft sm:px-6">{platforms[id].buildSummary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-2xl text-sm text-pretty text-muted">
            {requirementsNote} The files listed on each release are the final word on what is available.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
