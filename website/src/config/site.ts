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

import { parseRepository, parseSiteUrl } from "@/lib/repository";
import type { PackageFormat, PlatformId } from "@/lib/downloads/types";

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
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
  { label: "System requirements", href: "/#requirements" },
];

/** The page every Download button leads to. */
export const DOWNLOAD_PATH = "/download";

export const footerLinks: readonly NavLink[] = [
  { label: "Download", href: DOWNLOAD_PATH },
  { label: "Features", href: "/#features" },
  { label: "Getting started", href: "/#get-started" },
  { label: "About", href: "/#about" },
  { label: "System requirements", href: "/#requirements" },
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
    description: "Press Download. Quill points you to the file made for your computer, and the page after it walks you through setting it up.",
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

/* -------------------------------- setup guides ------------------------------- */

/** One way of installing: which downloaded files it covers, and the steps. */
export interface GuideTrack {
  id: string;
  /** Short heading, such as "Installer (.exe)". */
  title: string;
  /** Which downloaded files this track covers. */
  format: PackageFormat;
  /** Set for the portable build; otherwise the track covers the installer. */
  variant?: "portable";
  /** Used for `{file}` when the visitor's exact file isn't known. */
  fileFallback: string;
  steps: readonly GuideStep[];
}

export interface GuideStep {
  title: string;
  /** Plain text. `{file}` becomes the downloaded file's name. */
  body: string;
  /** Optional terminal command, shown in a copyable block. `{file}` works here too. */
  command?: string;
}

export interface PlatformGuide {
  intro: string;
  tracks: readonly GuideTrack[];
  /** Shown after the steps. Only things confirmed in the app's own documentation. */
  afterSetup: readonly GuideStep[];
}

const openAndWrite: GuideStep = {
  title: "Open Quill and start writing",
  body: "Start Quill from your apps, create a book on the shelf, and begin.",
};

const libraryNote: GuideStep = {
  title: "Where your writing lives",
  body: "Quill keeps books as plain files in a folder called Quill Library inside your Documents folder. File \u2192 Library Folder\u2026 lets you choose another place.",
};

/**
 * Step-by-step setup, per operating system. The steps describe how each kind of
 * file is normally opened on that system; nothing here claims anything about how
 * Quill is signed or notarised. Security prompts are described as "if you see".
 */
export const setupGuides: Record<PlatformId, PlatformGuide> = {
  windows: {
    intro: "Setting Quill up on Windows takes a couple of minutes.",
    tracks: [
      {
        id: "windows-installer",
        title: "Installer (.exe)",
        format: "exe",
        fileFallback: "the Quill installer",
        steps: [
          {
            title: "Find the file",
            body: "Open your Downloads folder, or click the download in your browser's download list. The file is {file}.",
          },
          {
            title: "Run the installer",
            body: "Double-click {file}. If Windows asks whether to allow the app to make changes, choose Yes.",
          },
          {
            title: "If Windows shows a blue warning",
            body: "If you see \u201cWindows protected your PC\u201d (SmartScreen), you downloaded the file from this site, so choose More info, then Run anyway. If you did not download it from here, close the window and delete the file.",
          },
          {
            title: "Follow the setup",
            body: "Step through the installer until it finishes.",
          },
          openAndWrite,
        ],
      },
      {
        id: "windows-portable",
        title: "Portable (.exe)",
        format: "exe",
        variant: "portable",
        fileFallback: "the portable Quill file",
        steps: [
          {
            title: "Put the file somewhere permanent",
            body: "A portable app doesn't install itself, so move {file} out of Downloads into a folder you'll remember, such as Documents or a USB drive.",
          },
          {
            title: "Open it",
            body: "Double-click {file}. If Windows shows a \u201cWindows protected your PC\u201d (SmartScreen) message, choose More info, then Run anyway, as long as you downloaded the file from this site.",
          },
          openAndWrite,
        ],
      },
    ],
    afterSetup: [libraryNote],
  },

  macos: {
    intro: "Setting Quill up on a Mac takes a minute. You don't need to run a separate installer.",
    tracks: [
      {
        id: "macos-dmg",
        title: "Disk image (.dmg)",
        format: "dmg",
        fileFallback: "the Quill disk image",
        steps: [
          {
            title: "Open the disk image",
            body: "Open your Downloads folder (or the Downloads stack in the Dock) and double-click {file}. A window opens with the Quill app inside.",
          },
          {
            title: "Drag Quill into Applications",
            body: "Drag the Quill icon onto the Applications folder shown in that window, or into the Applications folder in a Finder window.",
          },
          {
            title: "Eject the disk image",
            body: "In Finder's sidebar, click the eject button next to the Quill disk image. You can then delete {file}.",
          },
          {
            title: "Open Quill for the first time",
            body: "Open Quill from Applications. If macOS says it can't verify the app or that it's from an unidentified developer, you downloaded it from this site, so Control-click (or right-click) the Quill app, choose Open, then choose Open again. If you did not download it from here, don't open it.",
          },
          openAndWrite,
        ],
      },
    ],
    afterSetup: [libraryNote],
  },

  linux: {
    intro: "Quill for Linux comes as an AppImage, and sometimes as a .deb package. Use whichever you downloaded.",
    tracks: [
      {
        id: "linux-appimage",
        title: "AppImage",
        format: "appimage",
        fileFallback: "Quill.AppImage",
        steps: [
          {
            title: "Move it somewhere permanent",
            body: "An AppImage runs where it sits, so move {file} from Downloads to a folder you'll keep, such as ~/Applications.",
          },
          {
            title: "Make it executable",
            body: "In a terminal, in the folder that holds the file, give it permission to run. In most file managers you can instead right-click the file, open Properties, and allow it to run as a program.",
            command: "chmod +x {file}",
          },
          {
            title: "Run it",
            body: "Double-click the file, or start it from the terminal.",
            command: "./{file}",
          },
          {
            title: "If it doesn't start",
            body: "AppImages need FUSE 2 on some systems. If you see an error mentioning FUSE or libfuse.so.2, install your distribution's libfuse2 package (on Ubuntu and Debian it can be called libfuse2 or libfuse2t64) and try again.",
          },
          openAndWrite,
        ],
      },
      {
        id: "linux-deb",
        title: "Debian package (.deb)",
        format: "deb",
        fileFallback: "the Quill .deb file",
        steps: [
          {
            title: "Install the package",
            body: "For Debian, Ubuntu and their relatives, open a terminal in the folder that holds {file} and install it with apt, which also fetches anything it needs.",
            command: "sudo apt install ./{file}",
          },
          {
            title: "Open Quill",
            body: "Find Quill in your applications menu and open it.",
          },
          openAndWrite,
        ],
      },
    ],
    afterSetup: [libraryNote],
  },
};

/* ------------------------------- requirements ------------------------------- */

export const requirementsNote =
  "Detailed requirements, such as minimum operating-system versions, memory and processor, will be published once they have been confirmed.";
