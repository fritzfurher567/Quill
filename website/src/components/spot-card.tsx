"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * A card with a soft light that follows the pointer (fine pointers only, see
 * `.spot` in globals.css). It only sets two CSS variables; there is no
 * per-frame React work, and touch and reduced-motion visitors see a plain card.
 */
export function SpotCard({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`spot ${className}`}
      style={style}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}
    >
      {children}
    </div>
  );
}
