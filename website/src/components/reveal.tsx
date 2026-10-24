import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger, in milliseconds. */
  delay?: number;
}

/** Marks content for the scroll reveal handled by RevealController. */
export function Reveal({ children, as: Tag = "div", className, delay = 0 }: RevealProps) {
  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;
  return (
    <Tag data-reveal="" className={className} style={style}>
      {children}
    </Tag>
  );
}
