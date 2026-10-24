import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/navbar";
import { RevealController } from "@/components/reveal-controller";
import { githubLinks, product, siteUrl } from "@/config/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

/** Self-hosted (OFL-licensed Gelasio, subset to Latin): no third-party font requests. */
const gelasio = localFont({
  src: [
    { path: "./fonts/gelasio-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/gelasio-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/gelasio-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-gelasio",
  display: "swap",
});

const title = `${product.name}: ${product.tagline}`;

export const metadata: Metadata = {
  // Only set once the real domain is known, so no canonical URL is ever invented.
  ...(siteUrl ? { metadataBase: siteUrl, alternates: { canonical: "/" } } : {}),
  title: { default: title, template: `%s · ${product.name}` },
  description: product.description,
  applicationName: product.name,
  openGraph: {
    type: "website",
    siteName: product.name,
    title,
    description: product.description,
  },
  twitter: { card: "summary_large_image", title, description: product.description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f0e6" },
    { media: "(prefers-color-scheme: dark)", color: "#151410" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline script sets data-theme before React hydrates.
    <html lang="en" className={gelasio.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="scroll-progress" aria-hidden="true" />
        <Navbar githubUrl={githubLinks?.repo ?? null} />
        {children}
        <RevealController />
      </body>
    </html>
  );
}
