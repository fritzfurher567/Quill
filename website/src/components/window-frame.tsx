import type { ReactNode } from "react";

/** A neutral desktop-window frame around a mockup or screenshot. Fixed 16:10 so nothing shifts. */
export function WindowFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-surface shadow-(--shadow) ${className}`}>
      <div className="flex h-9 items-center gap-1.5 border-b border-line px-4" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
      </div>
      <div className="aspect-16/10 w-full">{children}</div>
    </div>
  );
}
