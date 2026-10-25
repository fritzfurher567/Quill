# Quill website

The official website for [Quill](https://github.com/fritzfurher567/Quill): _A quieter place to write._

A Next.js site (a landing page, a download page and a thank-you page) (App Router, TypeScript strict, Tailwind CSS v4) that helps writers find, download and get started with Quill. It lives in this folder, separate from the Electron app in the repository root, and is excluded from the app's packaged build and linter.

## Run it locally

```bash
cd website
npm install
cp .env.example .env.local   # optional: the defaults work
npm run dev                  # http://localhost:3000
```

| Command             | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Development server                                              |
| `npm run build`     | Production build                                                |
| `npm start`         | Serve the production build                                      |
| `npm run lint`      | ESLint (Next.js core-web-vitals + TypeScript rules)             |
| `npm run typecheck` | `tsc --noEmit`, strict                                          |
| `npm test`          | Unit tests (manifest, file matching, loader, OS detection, etc.) |
| `npm run check`     | All of the above, in order                                      |

Requires Node.js 20.9 or newer.

## Environment variables

Documented in [`.env.example`](.env.example).

| Variable                  | Required | Purpose                                                                                                                                                                                                  |
| ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GITHUB_REPO` | No       | `owner/name` of the repository that publishes installers. Falls back to `fritzfurher567/Quill` when **unset**. Set it **empty** to switch the site to its "repository not configured" state (see below). |
| `NEXT_PUBLIC_SITE_URL`    | No       | The final public origin, e.g. `https://example.com`. Only when set does the site emit a canonical URL, absolute Open Graph URLs, a sitemap entry and a sitemap line in `robots.txt`.                      |

> `NEXT_PUBLIC_*` values are inlined at **build** time, so change them in Vercel and redeploy.

## Deploy to Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `website` (Framework Preset: Next.js is detected automatically).
3. Add the environment variables above (all optional).
4. Deploy. Add the custom domain, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy so canonical/OG/sitemap URLs use the real domain.

Until `NEXT_PUBLIC_SITE_URL` is set, Open Graph image URLs fall back to Vercel's own deployment URL. No domain is ever guessed.

## How downloads work

Every **Download Quill** button leads to `/download`. There the visitor's operating system is detected, the manifest says which file is right, and pressing Download opens `/download/thanks/<file>`: a "Thanks for downloading Quill" page that starts the download and shows step-by-step setup for each OS.

### Publishing an installer

1. Put the installer in `public/downloads/` (this folder).
2. List it in `public/downloads/manifest.json`.
3. Commit and deploy. The thanks pages are generated from the manifest at build time.

```json
{
  "version": "1.0.0",
  "releasedAt": "2026-10-25",
  "notesUrl": "https://github.com/OWNER/REPO/releases/tag/v1.0.0",
  "files": [
    { "platform": "windows", "arch": "x64", "file": "Quill-Setup-1.0.0.exe" },
    { "platform": "windows", "arch": "x64", "file": "Quill-1.0.0-portable.exe", "variant": "portable" },
    { "platform": "macos", "arch": "arm64", "file": "Quill-1.0.0-arm64.dmg" },
    { "platform": "macos", "arch": "x64", "file": "Quill-1.0.0.dmg" },
    { "platform": "linux", "arch": "x64", "file": "Quill-1.0.0.AppImage" },
    { "platform": "linux", "arch": "x64", "url": "https://github.com/OWNER/REPO/releases/download/v1.0.0/quill_1.0.0_amd64.deb" }
  ]
}
```

| Field (per file) | Meaning |
| --- | --- |
| `platform` | `windows`, `macos` or `linux`. Required. |
| `arch` | `x64`, `arm64`, or `universal` for a build that runs on both. Required. |
| `file` **or** `url` | Exactly one. `file` is a plain file name inside `public/downloads/`. `url` is an `https://` address for a file hosted elsewhere (such as a GitHub release asset). |
| `variant` | `installer` (default) or `portable`. |
| `recommended` | `true` to make this the pick when several files fit one platform and CPU. |
| `size` | Bytes. Optional: measured automatically for files in this folder. |
| `sha256` | 64 hex characters. Optional. When given, the download page shows it so people can verify the file. |

Top level: `version` (required once files are listed; a leading `v` is dropped), `releasedAt` (optional date), `notesUrl` (optional `https://` link), `files`. The format (`.exe`, `.dmg`, `.AppImage`, `.deb`) comes from the file's extension and must suit its platform.

- **A mistake fails the build**, so the previous deployment stays live: unknown keys (typos), bad values, duplicates, a listed file that isn't in the folder, and so on, each reported with the entry it belongs to. `{ "files": [] }` (the committed state) is valid and shows "The first download isn't published yet".
- **Choosing the right file:** the manifest states each file's platform and CPU, so nothing is inferred from names. The browser's CPU is only used when it can be known reliably (Linux user agents, Client Hints). If the CPU can't be known and the platform has builds for different CPUs (for example both Mac builds), no file is recommended and the visitor is asked, with a hint for finding out. Mobile visitors are told Quill is for computers.
- **File size limits:** GitHub rejects pushed files over 100 MiB and the web uploader stops at 25 MiB; Vercel documents a 100 MB static upload cap on the Hobby plan for CLI deployments. Large installers are better hosted as GitHub release assets and referenced with `url`. External hosts must serve the file as an attachment (GitHub release assets do), or the browser will navigate away from the thanks page instead of downloading.
- Files in `public/downloads/` are served with `Content-Disposition: attachment` (`next.config.ts`). The folder is read at build time only; the pages are fully static.
- The earlier approach, reading GitHub's Releases API, was replaced by this manifest. It is in git history (commit `6905b46`) if you want it back.

### The thanks page and setup guide

`/download/thanks/<id>` is generated for each file in the manifest, is `noindex`, and starts the download about a second after it opens. A visible "download again" link is always there, and it works without JavaScript. The setup guide opens on the OS the file was made for, with the matching install method first. Its wording lives in `setupGuides` in `src/config/site.ts`; `{file}` becomes the downloaded file's name. It describes how each file type is normally opened, and says "if you see" about system security prompts, because nothing there claims how Quill is signed.

### Repository "not configured"

With `NEXT_PUBLIC_GITHUB_REPO=` (empty), **no GitHub link appears anywhere** (navbar, features, about, footer, empty download state). Downloads still work, because they come from the manifest.

## Updating content

Almost everything is in [`src/config/site.ts`](src/config/site.ts): product copy, navigation, features, preview captions, getting-started steps, platform definitions and the requirements note. Only confirmed facts belong there.

- **Real screenshots:** put the image in `public/screenshots/` and set `screenshot: { src, width, height }` on the matching entry in `previews`. The illustration and its "not a screenshot" label are replaced automatically, and the 16:10 frame prevents layout shift.
- **System requirements:** the table lists installer formats and CPU builds from the app's packaging config. Add minimum OS versions, memory or processor details to `platforms` / `requirementsNote` once they've been verified.
- **Logo:** the mark is a single SVG path in [`src/components/logo-mark.tsx`](src/components/logo-mark.tsx). The navbar, hero, footer, Apple touch icon and Open Graph image all use it; `src/app/icon.svg` is the favicon copy. Replace those to swap in official assets.

## Privacy

No analytics, tracking scripts, ads, pixels or cookies. The only thing stored is the visitor's theme choice in `localStorage`. Fonts (Gelasio, SIL OFL) are self-hosted from `src/app/fonts`, so no third-party font requests are made. Downloads go straight to GitHub.

## Motion and accessibility

- Staggered hero entrance, scroll reveals, hover states, a pointer-following light on feature cards, a hairline reading-progress bar and a slowly drifting line are all CSS plus one small `IntersectionObserver`; there is no animation library.
- `prefers-reduced-motion: reduce` disables all of it, and content is never hidden unless scripting is running and the element is still below the fold, so nothing can stay invisible if an animation fails.
- Semantic landmarks, skip link, visible focus rings, native radio group for the platform choice, a tabbed preview with arrow-key support, a focusable scrollable table, 44px touch targets, live regions for status changes, and status shown with icons and words rather than colour alone. Text contrast is at least 5:1 in both themes.

## About Skiper UI

The brief asked for [Skiper UI](https://skiper-ui.com/) components. What was found when researching it:

- Components are installed with the shadcn CLI (`npx shadcn add @skiper-ui/<name>`); the docs list `framer-motion`, `clsx`, `tailwind-merge` and `lucide-react` as dependencies, and some components also need `gsap` or `react-use-measure`.
- **Free components require attribution to Skiper UI.** Pro components need a paid licence key (`SKIPER_LICENSE_KEY`) and no attribution.
- The component source is served from `skiper-ui.com/r/*.json`, which disallows automated fetching, and the component catalogue loads dynamically, so the individual components, their licences and their code could not be inspected from here. The only free component named in the available documentation is a sign-in screen, which doesn't fit a download page.

So **no Skiper UI code is included**, and none of it is copied. Following the brief's fallback, the same kinds of effects were built as small custom pieces: a masked word-by-word headline entrance, scroll reveals, a pointer-following spotlight on cards, a self-drawing decorative stroke and a reading-progress hairline. If you later add a Skiper component, install it through their CLI, check that component's licence on its page, and add the required attribution.
