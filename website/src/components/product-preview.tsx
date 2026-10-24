"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { Illustration } from "@/components/product-illustrations";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { WindowFrame } from "@/components/window-frame";
import { previews } from "@/config/site";

/**
 * Tabbed preview. Each entry shows its real screenshot when one is configured
 * (config/site.ts), otherwise a clearly labelled illustration. Every frame is
 * 16:10 either way, so swapping in a screenshot never shifts the layout.
 */
export function ProductPreview() {
  const [activeId, setActiveId] = useState(previews[0]?.id ?? "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(0, previews.findIndex((item) => item.id === activeId));
  const active = previews[activeIndex];

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = -1;
    if (event.key in keys) next = (activeIndex + keys[event.key]! + previews.length) % previews.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = previews.length - 1;
    if (next < 0) return;
    event.preventDefault();
    const target = previews[next];
    if (target) {
      setActiveId(target.id);
      tabRefs.current[next]?.focus();
    }
  }

  if (!active) return null;

  return (
    <section id="preview" aria-labelledby="preview-title" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          id="preview-title"
          eyebrow="A look at Quill"
          title="A place that stays out of your way"
          intro="Quill's windows are meant to be quiet. These illustrations show the general idea."
        />

        <Reveal delay={80} className="mt-10">
          <div role="tablist" aria-label="Preview views" onKeyDown={onKeyDown} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">
            {previews.map((item, index) => {
              const selected = item.id === active.id;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(item.id)}
                  className={`min-h-11 shrink-0 rounded-lg px-4 text-[0.9375rem] transition-colors ${
                    selected ? "bg-ink text-bg" : "text-ink-soft hover:bg-bg hover:text-ink"
                  }`}
                >
                  {item.title}
                </button>
              );
            })}
          </div>

          <div key={active.id} role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`} tabIndex={0} className="fade-up mt-6 rounded-2xl">
            <WindowFrame className="mx-auto max-w-4xl">
              {active.screenshot ? (
                <Image src={active.screenshot.src} width={active.screenshot.width} height={active.screenshot.height} alt={active.alt} className="h-full w-full object-cover object-top" />
              ) : (
                <div role="img" aria-label={active.alt} className="h-full w-full">
                  <Illustration kind={active.illustration} />
                </div>
              )}
            </WindowFrame>
            <p className="mx-auto mt-4 max-w-4xl text-center text-sm text-muted">
              {active.caption}
              {!active.screenshot && " · Illustration, not a screenshot of the released app."}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
