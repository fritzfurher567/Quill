"use client";

import { useEffect } from "react";

/**
 * Scroll reveals, with no animation library.
 *
 * Elements marked `data-reveal` are server-rendered fully visible. Only once
 * this effect runs, and only for elements still below the fold, are they hidden
 * and then faded in on entering the viewport. So:
 * - no JavaScript, an old browser, or a failed script: everything stays visible;
 * - reduced motion: nothing is ever hidden;
 * - content already on screen (or scrolled past) is never hidden at all.
 */
export function RevealController() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    const reveal = (element: Element) => element.setAttribute("data-revealed", "");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    const viewportHeight = window.innerHeight;
    for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      if (element.getBoundingClientRect().top < viewportHeight) reveal(element);
      else observer.observe(element);
    }

    root.setAttribute("data-reveal-ready", "");
    return () => {
      observer.disconnect();
      root.removeAttribute("data-reveal-ready");
    };
  }, []);

  return null;
}
