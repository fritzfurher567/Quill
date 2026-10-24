/**
 * Illustrative mockups of Quill, drawn locally in SVG (no external images).
 *
 * They are NOT screenshots and are always labelled as illustrations where they
 * appear. They use the theme tokens, so they follow light and dark mode. To use
 * a real screenshot instead, set `screenshot` on the matching entry in
 * src/config/site.ts; ProductPreview then shows it in place of these.
 */

const SERIF = "var(--font-gelasio), Georgia, serif";

export function PageIllustration({ animated = false }: { animated?: boolean }) {
  const lines = [74, 78, 66, 76, 70, 42];
  const lines2 = [78, 72, 77, 58];
  return (
    <svg viewBox="0 0 160 100" className="block h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="100" className="fill-sunken" />
      {/* Section list */}
      <rect width="36" height="100" className="fill-surface" />
      <rect x="36" width="0.6" height="100" className="fill-line" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          {i === 1 && <rect x="4" y={13 + i * 9.5 - 3} width="28" height="7" rx="1.6" className="fill-accent-soft" />}
          <rect x="7" y={13 + i * 9.5} width={[18, 22, 16, 20, 14, 19][i]} height="1.6" rx="0.8" className={i === 1 ? "fill-ink-soft" : "fill-line-strong"} />
        </g>
      ))}
      {/* The page */}
      <rect x="52" y="8" width="96" height="104" rx="2" className="fill-surface stroke-line" strokeWidth="0.5" />
      <text x="64" y="26" fontFamily={SERIF} fontSize="5.6" fontStyle="italic" className="fill-ink-soft">
        Chapter One
      </text>
      {lines.map((w, i) => (
        <rect key={i} x="64" y={34 + i * 5.2} width={w} height="1.7" rx="0.85" className="fill-line-strong" opacity="0.8" />
      ))}
      {lines2.map((w, i) => (
        <rect key={`b${i}`} x="64" y={34 + (lines.length + 0.8) * 5.2 + i * 5.2} width={w} height="1.7" rx="0.85" className="fill-line-strong" opacity="0.8" />
      ))}
      <rect
        x={64 + lines2[lines2.length - 1]! + 1.6}
        y={34 + (lines.length + 0.8) * 5.2 + (lines2.length - 1) * 5.2 - 1.2}
        width="1"
        height="4.2"
        rx="0.4"
        className={`fill-accent ${animated ? "caret" : ""}`}
      />
    </svg>
  );
}

const SHELVES: ReadonlyArray<ReadonlyArray<readonly [width: number, height: number, tone: 1 | 2 | 3 | 4 | 5]>> = [
  [[10, 24, 1], [8, 28, 3], [12, 22, 5], [9, 26, 2], [11, 20, 4], [8, 27, 1], [10, 23, 3]],
  [[11, 26, 4], [9, 21, 2], [12, 28, 1], [8, 24, 5], [10, 22, 3], [11, 27, 2]],
  [[9, 25, 5], [12, 23, 1], [8, 28, 3], [10, 21, 4], [12, 26, 2], [9, 24, 1], [10, 22, 5]],
];
const TONE = { 1: "fill-mock-1", 2: "fill-mock-2", 3: "fill-mock-3", 4: "fill-mock-4", 5: "fill-mock-5" } as const;

export function ShelfIllustration() {
  return (
    <svg viewBox="0 0 160 100" className="block h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="100" className="fill-sunken" />
      {SHELVES.map((books, row) => {
        const baseline = 32 + row * 30;
        let x = 20;
        return (
          <g key={row}>
            {books.map(([w, h, tone], i) => {
              const bx = x;
              x += w + 2.4;
              return (
                <g key={i}>
                  <rect x={bx} y={baseline - h} width={w} height={h} rx="0.8" className={TONE[tone]} />
                  <rect x={bx + 1.8} y={baseline - h + 4} width={w - 3.6} height="1.2" rx="0.6" fill="currentColor" className="text-surface" opacity="0.7" />
                  <rect x={bx + 1.8} y={baseline - h + 7} width={(w - 3.6) * 0.6} height="1" rx="0.5" fill="currentColor" className="text-surface" opacity="0.45" />
                </g>
              );
            })}
            <rect x="12" y={baseline} width="136" height="2.4" rx="0.8" className="fill-line-strong" />
            <rect x="12" y={baseline + 2.4} width="136" height="1.2" className="fill-line" opacity="0.7" />
          </g>
        );
      })}
    </svg>
  );
}

export function OutlineIllustration() {
  const cols = 4;
  const rows = 2;
  const w = 33;
  const h = 40;
  const gap = 4;
  const startX = (160 - (cols * w + (cols - 1) * gap)) / 2;
  const startY = (100 - (rows * h + (rows - 1) * gap)) / 2;
  return (
    <svg viewBox="0 0 160 100" className="block h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="100" className="fill-sunken" />
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = startX + (i % cols) * (w + gap);
        const y = startY + Math.floor(i / cols) * (h + gap);
        const lifted = i === 5;
        return (
          <g key={i} transform={lifted ? `translate(${x + 1.5} ${y - 3}) rotate(-2.5 ${w / 2} ${h / 2})` : `translate(${x} ${y})`}>
            <rect width={w} height={h} rx="1.6" className={lifted ? "fill-surface stroke-accent" : "fill-surface stroke-line"} strokeWidth={lifted ? 0.9 : 0.5} />
            <text x="4" y="12" fontFamily={SERIF} fontSize="8" className="fill-line-strong">
              {i + 1}
            </text>
            <rect x="4" y="17" width={w - 8} height="1.5" rx="0.75" className="fill-ink-soft" opacity="0.55" />
            <rect x="4" y="22" width={(w - 8) * 0.8} height="1.4" rx="0.7" className="fill-line-strong" />
            <rect x="4" y="26.5" width={(w - 8) * 0.9} height="1.4" rx="0.7" className="fill-line-strong" />
            <rect x="4" y="31" width={(w - 8) * 0.5} height="1.4" rx="0.7" className="fill-line-strong" />
          </g>
        );
      })}
    </svg>
  );
}

export function Illustration({ kind }: { kind: "page" | "shelf" | "outline" }) {
  if (kind === "shelf") return <ShelfIllustration />;
  if (kind === "outline") return <OutlineIllustration />;
  return <PageIllustration />;
}
