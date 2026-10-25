import type { CSSProperties } from "react";

/** Each word slides up from behind a mask, one after another. Pure CSS. */
export function AnimatedHeadline({ text, id, className = "" }: { text: string; id: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h1
      id={id}
      className={`font-serif text-[2.6rem] leading-[1.04] tracking-tight text-balance min-[400px]:text-5xl sm:text-6xl lg:text-7xl ${className}`}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="word-mask">
            <span className="word" style={{ "--i": index } as CSSProperties}>
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}
