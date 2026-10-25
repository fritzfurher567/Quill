"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, DownloadIcon, ExternalIcon, MenuIcon } from "@/components/icons";
import { Logo } from "@/components/logo-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { DOWNLOAD_PATH, navLinks } from "@/config/site";

/**
 * @param githubUrl The repository URL, or null while none is configured. No
 *                  GitHub link is rendered without a real address.
 */
export function Navbar({ githubUrl }: { githubUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the menu and returns focus to its button; a click outside closes it too.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    // Leaving the mobile breakpoint with the menu open would leave it stuck; close it.
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const linkClass =
    "rounded-lg px-3 py-2 text-[0.9375rem] text-ink-soft transition-colors hover:bg-surface hover:text-ink";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled || open
            ? "border-line bg-bg/85 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" aria-label="Quill, home" className="-ml-1 rounded-lg p-1">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-1.5`}>
                GitHub
                <ExternalIcon className="size-3.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link href={DOWNLOAD_PATH} className="btn btn-primary hidden sm:inline-flex">
              <DownloadIcon className="size-4" />
              Download Quill
            </Link>
            <button
              ref={buttonRef}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-xl border border-transparent text-ink-soft transition-colors hover:border-line hover:bg-surface hover:text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div ref={panelRef} id="mobile-menu" className="border-t border-line lg:hidden">
            <nav aria-label="Mobile" className="fade-up mx-auto flex max-w-6xl flex-col px-5 pb-5 pt-3 sm:px-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center rounded-lg px-2 text-base text-ink hover:bg-surface"
                >
                  {link.label}
                </Link>
              ))}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center gap-2 rounded-lg px-2 text-base text-ink hover:bg-surface"
                >
                  GitHub
                  <ExternalIcon className="size-4" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
              <Link href={DOWNLOAD_PATH} onClick={() => setOpen(false)} className="btn btn-primary mt-3 sm:hidden">
                <DownloadIcon className="size-4" />
                Download Quill
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
