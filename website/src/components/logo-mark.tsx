/**
 * Quill's logo: one stroke of ink that curls inward and ends in a drop.
 *
 * This file is the single source of truth for the symbol. The navbar, hero,
 * footer, favicon (src/app/icon.tsx), Apple touch icon and Open Graph image all
 * draw from `LOGO_PATH`/`LOGO_DOT`, so replacing the mark when official assets
 * arrive means editing the constants below (or swapping `LogoMark`'s body).
 */

/** The spiral stroke, in a 32 x 32 viewBox. */
export const LOGO_PATH =
  "M6 25.5C2.6 19.4 4.6 11.2 11 7.4c6.2-3.6 14.2-1.4 16.6 5.2 2.2 6-1.6 12.4-7.8 13.4-5.4.8-10-3-9.4-8.2.5-4.2 4.6-6.8 8.4-5.6 3.4 1.1 4.4 5.4 1.8 7.4";

/** The ink drop at the end of the stroke. */
export const LOGO_DOT = { cx: 19.2, cy: 17.6, r: 1.4 } as const;

export const LOGO_STROKE_WIDTH = 2.4;

interface LogoMarkProps {
  className?: string;
  /** Give the mark an accessible name. Omit when it sits next to the wordmark. */
  title?: string;
}

export function LogoMark({ className, title }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={LOGO_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={LOGO_PATH} />
      <circle {...LOGO_DOT} fill="currentColor" stroke="none" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}

/** The mark paired with the "Quill" wordmark. */
export function Logo({ className = "", markClassName = "size-7", wordmarkClassName = "text-xl" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={`font-serif font-bold tracking-tight ${wordmarkClassName}`}>Quill</span>
    </span>
  );
}
