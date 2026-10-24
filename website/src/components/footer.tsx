import { ExternalIcon } from "@/components/icons";
import { Logo } from "@/components/logo-mark";
import { footerLinks, githubLinks, product } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-sunken/50">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[0.9375rem] text-ink-soft">{product.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-medium text-muted">Explore</h2>
            <ul className="mt-4 space-y-1">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="inline-flex min-h-9 items-center text-[0.9375rem] text-ink-soft transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {githubLinks && (
            <nav aria-label="Source code and releases">
              <h2 className="text-sm font-medium text-muted">Open source</h2>
              <ul className="mt-4 space-y-1">
                {[
                  { label: "Source code", href: githubLinks.repo },
                  { label: "Releases", href: githubLinks.releases },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 text-[0.9375rem] text-ink-soft transition-colors hover:text-ink">
                      {link.label}
                      <ExternalIcon className="size-3.5" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <section aria-labelledby="privacy-title" className="mt-12 max-w-2xl border-t border-line pt-8">
          <h2 id="privacy-title" className="text-sm font-medium text-muted">Privacy</h2>
          <p className="mt-2 text-sm text-pretty text-ink-soft">
            This website has no analytics, advertising or tracking, and sets no cookies. It remembers one thing in your browser, your light or dark theme choice, and nothing is sent anywhere. Fonts are served from this site. If you download an installer, the file comes from GitHub, which handles that request under its own privacy policy. This describes the website only, not the Quill app.
          </p>
        </section>

        <p className="mt-10 text-sm text-muted">&copy; {year} Quill. A quieter place to write.</p>
      </div>
    </footer>
  );
}
