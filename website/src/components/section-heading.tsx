import { Reveal } from "@/components/reveal";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}

export function SectionHeading({ id, eyebrow, title, intro, align = "left" }: SectionHeadingProps) {
  const center = align === "center";
  return (
    <Reveal className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="text-sm font-medium tracking-wide text-muted uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-3 font-serif text-3xl leading-[1.12] tracking-tight text-balance sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {intro && <p className="mt-4 text-base text-pretty text-ink-soft sm:text-lg">{intro}</p>}
    </Reveal>
  );
}
