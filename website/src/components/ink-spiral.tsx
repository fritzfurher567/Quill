import { LOGO_DOT, LOGO_PATH } from "@/components/logo-mark";

/**
 * A single decorative stroke of ink (the Quill mark, enlarged): it draws itself
 * once, then drifts very slowly. Purely decorative, so it is hidden from
 * assistive technology, and the motion stops under `prefers-reduced-motion`.
 */
export function InkSpiral({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute text-ink ${className}`}
    >
      <g className="drift">
        <path d={LOGO_PATH} pathLength="1" className="draw" stroke="currentColor" strokeWidth="0.45" strokeLinecap="round" />
        <circle {...LOGO_DOT} r="0.35" fill="currentColor" />
      </g>
    </svg>
  );
}
