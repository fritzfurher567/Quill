/**
 * Central configuration for the Quill website.
 *
 * Everything that changes when the product changes lives here: product
 * metadata, the GitHub repository, navigation, features, previews, platform
 * definitions and system requirements. Components read from this file; none of
 * them hard-code product claims.
 *
 * Content rule: only state what has been confirmed. Anything not yet known
 * (minimum OS versions, memory, extra app features) stays out until verified.
 */

import { parseRepository, parseSiteUrl } from "@/lib/github/repository";
import type { PackageFormat, PlatformId } from "@/lib/github/types";

/* ------------------------------ repository ------------------------------ */

/**
 * The repository named in the project brief. It is used only when
 * NEXT_PUBLIC_GITHUB_REPO is not set at all; setting the variable to an empty
 * value switches the site to its "repository not configured" state.
 */
export const DEFAULT_REPOSITORY = "fritzfurher567/Quill";

/** Raw "owner/name" setting (public information, safe in the browser bundle). */
export const repositorySetting: string = process.env.NEXT_PUBLIC_GITHUB_REPO ?? DEFAULT_REPOSITORY;

export const repository = parseRepository(repositorySetting);

/** GitHub URLs, or null until a valid repository is configured. */
export const githubLinks =
  repository.status === "ok" ? { repo: repository.url, releases: repository.releasesUrl } : null;

/** The production origin. Null until the real domain is known; nothing is guessed. */
export const siteUrl = parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/* -------------------------------- product -------------------------------- */

export const product = {
  name: "Quill",
  tagline: "A quieter place to write.",
  description:
    "Quill is a free, open-source writing tool for writers, available for Windows, macOS and Linux. A quieter place to write.",
  heroCopy:
    "Quill is a free writing tool for writers. Download it, open it, and give your words some room.",
} as const;

/* ------------------------------ navigation ------------------------------- */

export interface NavLink {
  label: string;
  href: string;
}

/** In-page anchors shown in the navbar. GitHub is added separately when configured. */
export const navLinks: readonly NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "System requirements", href: "#requirements" },
];

export const footerLinks: readonly NavLink[] = [
  { label: "Download", href: "#download" },
  { label: "Features", href: "#features" },
  { label: "Getting started", href: "#get-started" },
  { label: "About", href: "#about" },
  { label: "System requirements", href: "#requirements" },
];

/* --------------------------------- platforms ------------------------------- */

export interface PlatformDefinition {
  id: PlatformId;
  label: string;
  /** Installer formats the download flow looks for, best first. */
  formats: readonly PackageFormat[];
  /** What the requirements table says about the installers. */
  installerSummary: string;
  /**
   * CPU builds named in the app's packaging configuration (package.json in the
   * repository root). The files attached to each release are the final word.
   */
  buildSummary: string;
}

export const platforms: Record<PlatformId, PlatformDefinition> = {
  windows: {
    id: "windows",
    label: "Windows",
    formats: ["exe"],
    installerSummary: ".exe installer, and a portable .exe",
    buildSummary: "x64",
  },
  macos: {
    id: "macos",
    label: "macOS",
    formats: ["dmg"],
    installerSummary: ".dmg disk image",
    buildSummary: "Apple silicon (arm64) and Intel (x64)",
  },
  linux: {
    id: "linux",
    label: "Linux",
    formats: ["appimage", "deb"],
    installerSummary: ".AppImage, and .deb when a release includes one",
    buildSummary: "x64 and arm64",
  },
};

export const platformOrder: readonly PlatformId[] = ["windows", "macos", "linux"];

/* --------------------------------- features -------------------------------- */

export type FeatureIcon = "page" | "calm" | "free" | "desktop" | "open";

export interface Feature {
  id: string;
  icon: FeatureIcon;
  title: string;
  description: string;
  /** Optional link shown only when the GitHub repository is configured. */
  linkToSource?: boolean;
}

/**
 * Confirmed, general positioning only. Add specific application features here
 * once they have been confirmed.
 */
export const features: readonly Feature[] = [
  {
    id: "focused",
    icon: "page",
    title: "Made for writing",
    description:
      "Quill is built around the act of writing itself, so the page stays at the centre and everything else stays out of the way.",
  },
  {
    id: "calm",
    icon: "calm",
    title: "A calm place to settle in",
    description: "A quieter environment for writers: room to stay with a thought and see it through.",
  },
  {
    id: "free",
    icon: "free",
    title: "Completely free",
    description: "Quill costs nothing to download or use. Get it, install it, and start writing.",
  },
  {
    id: "desktop",
    icon: "desktop",
    title: "On the desktop you use",
    description: "Available for Windows, macOS and Linux, so Quill can live on whichever computer you write on.",
  },
  {
    id: "open",
    icon: "open",
    title: "Open source",
    description: "Quill is developed in the open. Its source code is public, so you can see how it works and follow along.",
    linkToSource: true,
  },
];

/* --------------------------------- previews -------------------------------- */

export interface Preview {
  id: string;
  /** Short tab label. */
  title: string;
  caption: string;
  /** Alt text for the illustration, or for the screenshot once `src` is set. */
  alt: string;
  /** Which built-in illustration to draw while there is no screenshot. */
  illustration: "page" | "shelf" | "outline";
  /**
   * To use a real screenshot, drop the file in `public/screenshots/` and set
   * `src` ("/screenshots/page.png") together with its true pixel size. The
   * illustration is then replaced and the "Illustration" label disappears.
   */
  screenshot?: { src: string; width: number; height: number };
}

export const previews: readonly Preview[] = [
  {
    id: "page",
    title: "The page",
    caption: "A quiet page to write on.",
    alt: "Illustration of a writing view: a list of sections on the left and a single page of text in the centre.",
    illustration: "page",
  },
  {
    id: "shelf",
    title: "Your library",
    caption: "Your work, kept together.",
    alt: "Illustration of a library: rows of book covers resting on shelves.",
    illustration: "shelf",
  },
  {
    id: "outline",
    title: "The big picture",
    caption: "Step back and see the whole.",
    alt: "Illustration of an outline: a grid of index cards, one of them being moved.",
    illustration: "outline",
  },
];

/* ------------------------------ getting started ----------------------------- */

export const gettingStarted: readonly { title: string; description: string }[] = [
  {
    title: "Download Quill",
    description: "Pick your operating system in the download section and get the installer made for it.",
  },
  {
    title: "Install it",
    description: "Open the file you downloaded and follow the usual steps for installing an app on your system.",
  },
  {
    title: "Open Quill and start writing",
    description: "Launch Quill, find a blank page, and begin.",
  },
];

/* ------------------------------- requirements ------------------------------- */

export const requirementsNote =
  "Detailed requirements, such as minimum operating-system versions, memory and processor, will be published once they have been confirmed.";
