# Quill website

The official website for [Quill](https://github.com/fritzfurher567/Quill): _A quieter place to write._

A single-page Next.js site (App Router, TypeScript strict, Tailwind CSS v4) that helps writers find, download and get started with Quill. It lives in this folder, separate from the Electron app in the repository root, and is excluded from the app's packaged build and linter.

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
| `npm test`          | Unit tests (release lookup, asset matching, OS detection, etc.) |
| `npm run check`     | All of the above, in order                                      |

Requires Node.js 20.9 or newer.

## Environment variables

Documented in [`.env.example`](.env.example).

| Variable                  | Required | Purpose                                                                                                                                                                                                  |
| ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GITHUB_REPO` | No       | `owner/name` of the repository that publishes installers. Falls back to `fritzfurher567/Quill` when **unset**. Set it **empty** to switch the site to its "repository not configured" state (see below). |
| `NEXT_PUBLIC_SITE_URL`    | No       | The final public origin, e.g. `https://example.com`. Only when set does the site emit a canonical URL, absolute Open Graph URLs, a sitemap entry and a sitemap line in `robots.txt`.                      |
| `GITHUB_TOKEN`            | No       | Server-side only (never `NEXT_PUBLIC_`). Raises GitHub's 60-requests-per-hour anonymous limit. A token with no permissions is enough, since the repository is public.                                     |

> `NEXT_PUBLIC_*` values are inlined at **build** time, so change them in Vercel and redeploy.

## Deploy to Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `website` (Framework Preset: Next.js is detected automatically).
3. Add the environment variables above (all optional).
4. Deploy. Add the custom domain, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy so canonical/OG/sitemap URLs use the real domain.

Until `NEXT_PUBLIC_SITE_URL` is set, Open Graph image URLs fall back to Vercel's own deployment URL. No domain is ever guessed.

## How downloads work

- `src/lib/github/releases.ts` reads the repository's **release list** (not GitHub's "latest release" endpoint, which can't be trusted to skip prereleases) and picks the newest published release that is neither a draft nor a prerelease.
- `src/lib/github/assets.ts` keeps only real installers (`.exe`, `.dmg`, `.AppImage`, `.deb`), drops checksums, blockmaps, update manifests and zip archives, and reads the CPU architecture **only** when the filename states it. Download URLs are GitHub's own `browser_download_url`, and are rejected unless they point into this repository's releases. Nothing is built from guessed filenames.
- The page is statically generated and regenerated at most every 15 minutes (`revalidate = 900`), so GitHub is not called per visitor. "Check again" re-runs the lookup through `/api/release`, which keeps the token on the server.
- The browser guesses the visitor's OS (`navigator.userAgentData`, then the user-agent string). The CPU is only used when Client Hints report it reliably. When it can't be known and several builds exist, the visitor is asked to choose; nothing is guessed. All three platforms are always selectable.
- States handled: loading, loaded, no stable release, no installer for the chosen platform, rate limit, network/server failure, malformed responses, missing or invalid repository configuration, and unknown repository.

### Repository "not configured"

With `NEXT_PUBLIC_GITHUB_REPO=` (empty), no download is offered, and **no GitHub link appears anywhere** (navbar, features, about, footer).

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
