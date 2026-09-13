# Dr. Fran Gaik — Clinical Psychology & Coaching

An ultra-modern, dark-luxury portfolio and practice site for **Dr. Frances Gaik, PsyD, LCPC** —
author of *Managing Depression with Qigong*. Built with Next.js 15 (App Router), React 19,
TypeScript, and a custom CSS design system with a 13-palette theme engine (dark in every
palette), a looping background film, an animated signature intro, and an interactive book
showcase.

**Live site → [lifecoachdoc.vercel.app](https://lifecoachdoc.vercel.app)**

| Desktop | Mobile |
| :---: | :---: |
| [![Dr. Fran Gaik — desktop](docs/live-site.jpg)](https://lifecoachdoc.vercel.app) | <img src="docs/live-site-mobile.jpg" width="300" alt="Dr. Fran Gaik — mobile" /> |

Both captures are of the production deployment, and the mobile one is a real 390×844
browser capture rather than a mockup — re-take them any time with
`npm run check:production -- <url>`, which writes fresh screenshots to
`.freebuff/production/`.

> All clinical copy is ingested from the author's original site
> ([lifecoachdoc.net](https://www.lifecoachdoc.net/welcome.html)) and verified retailer
> listings. The repo ships a reviewed static snapshot in `config/siteData.ts`.

---

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command                    | What it does                                    |
| -------------------------- | ----------------------------------------------- |
| `npm run dev`              | Development server with hot reload              |
| `npm run build`            | Production build (Vercel-ready)                 |
| `npm run start`            | Serve the production build                      |
| `npm run typecheck`        | Strict TypeScript check (`tsc --noEmit`)        |
| `npm run lint`             | ESLint (Next core-web-vitals)                   |
| `npm run check:production` | Real-browser audit of a deployed URL (see below) |
| `npm run sync:content`     | Crawl the legacy site via Playwright and print a structured diff source |
| `npm run build:ambient -- clip.mp4` | Re-encode the supplied clip into the background loop + poster |
| `npm run build:social -- --hero hero.png --capture full.png` | Rebuild the share card and README capture |

> First Playwright run may need `npx playwright install chromium`.

---

## Routes

| Route              | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `/`                | Animated hero, stats, services, books, Qigong, hypnosis, reviews |
| `/books`           | Both published works, press quotes, purchase links             |
| `/about`           | Full credentials, experience, and clinical philosophy          |
| `/reviews`         | All source-attributed reviews, filterable                      |
| `/services`        | All eight verified services with full source text              |
| `/depression-and-qigong-treatment` | Doctoral research narrative + complementary-care disclaimer |
| `/hypnosis`        | Clinical hypnosis education + application areas                |
| `/contact`         | Phone, emails, insurance, location                             |
| `/privacy`         | HIPAA notice of privacy practices                              |

---

## Search, social & share cards

The whole machine-facing layer lives in **`config/seo.ts`**, so no route can drift into
having a title but no card.

- **One helper, every page.** `pageMetadata({ title, description, path })` returns title,
  description, canonical, keywords and a matching OpenGraph + Twitter card. The rendered
  page title and the card title are built from the same string, so a link looks identical
  in a feed, in Messenger, and in the tab bar.
- **`metadataBase`** makes every relative URL absolute, which is what lets a card resolve
  when the link is pasted outside a browser.
- **The share card** is `public/og/og-image.jpg` — a real 1200×630 JPEG (≈150 KB), the
  canonical large-preview size for Facebook, Messenger, WhatsApp, LinkedIn, Slack, Discord
  and X, so every platform crops it the same way. `scripts/build-social-assets.mjs`
  composes it: the hero is letterboxed onto a blurred, darkened copy of itself (nothing is
  cut off — headline and portrait both survive), framed with rounded corners, a drop shadow
  and the domain, and the file is emitted as a 4:4:4 JPEG because it is a photograph of a
  page and the ~7× size saving keeps the crawler fetch instant.
- **Social safety net**: the manifest, sitemap, description and `og:image:alt` are all
  generated from the same constants, so a rename cannot leave them disagreeing.
- **Per-route metadata files**: `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`.
  The sitemap carries `lastModified` from `site.syncedAt` (when the copy was last verified
  against the author's sources) rather than the build date, and declares the card image for
  every page so deep links preview too.
- **Preview builds are `noindex`.** Vercel previews inherit the production canonical URL, so
  `robots` is driven by `VERCEL_ENV`; only production is indexable.
- **Structured data** (`structuredData()` in `config/seo.ts`, rendered once in the root
  layout) describes a `WebSite`, the `Person`, the `ProfessionalService` (with the
  Willowbrook address) and both `Book`s with ISBN, page count, publisher and a priced
  `Offer`. There is deliberately **no `aggregateRating`** — inventing a rating count to win
  a rich snippet would misrepresent the sources the reviews come from.

### Verifying it after a deploy

```bash
npm run check:production -- https://lifecoachdoc.vercel.app
```

`scripts/check-production.mjs` drives a real browser against the deployed URL and fails the
run if anything regresses: every route answers `200` with an `h1`, the canonical points at
its own path and agrees with the card origin, each page ships structured data and an
indexable robots meta, no route overflows horizontally at desktop/tablet/mobile, no console
errors or failed requests, every metadata file resolves (`robots.txt`, `sitemap.xml`,
`manifest.webmanifest`, both icons, the card), the sitemap lists all nine routes, and — the
check that actually predicts whether a link will preview — the page is fetched with
Facebook's own crawler user-agent and the `og:image` it finds is downloaded and confirmed to
come back as an image type. Screenshots land in `.freebuff/production/`.

---

## Theme system

Thirteen professional palettes, all dark — the site has one mode, so a palette is the whole
choice. Defined in `config/themes.ts`:

**Teal Ember** *(default, brand)* · **Graphite Rose** · Scarlet Noir · Inferno Ember ·
Bumblebee Noir · Solar Slate · Forest Copper · Cobalt Aurora · Ocean Mist · Plum Radiance ·
Glacier Steel · Indigo Mineral · Sandstone Ink

- The picker lives in the **footer** (one swatch per palette); the header keeps a single
  call to action, so there is no mode switch to make and nothing to explain.
- Selection persists in `localStorage` (`fg-theme`).
- Tokens are written as CSS custom properties on `<html>`, so backgrounds, glows, cards,
  buttons, particles, and the 3D book all recolor automatically.
- Two per-palette numbers keep every palette as clean as the default over the film:
  `ambientGlow` proportions the palette-tinted light so pale accents cannot fog the
  backdrop, and `filmVeil` settles the clip into the palette's own darkness (a scarlet or
  fire palette over green water otherwise reads as two unrelated pictures).
- `:root` in `app/globals.css` mirrors the default (Teal Ember) so server-rendered HTML
  paints correctly before hydration.

### Customizing

- **Add a palette:** append a `ThemeDefinition` to `themes` in `config/themes.ts`.
- **Change default:** edit `defaultThemeId` in the same file and mirror the values in
  `:root` of `globals.css`.

---

## Shell

- **Header:** the author mark, the primary nav (desktop), and one call to action — *Get the
  Book* — at every width. Nothing else competes with it.
- **Phone navigation** (`components/MobileNav.tsx`): a floating pill that hovers over the
  page and **slides off the bottom of the screen while the visitor reads downward**, coming
  straight back on any scroll up — so it is present when a thumb reaches for it and never
  covers the line being read. *More* raises a sheet out of the pill rather than dropping
  from the top of the screen.
- **Back to top** (`components/BackToTop.tsx`): a pill that appears once the visitor is past
  the fold, sits above the phone nav, and returns them to the hero in one tap.
- **Store buttons:** every shop a book can be bought from is offered as its own official
  logo on a **white plate and nothing else** — no written name, no edition note. The
  artwork (`public/stores/`) is flattened onto white, because these logos are drawn in dark
  ink for a light ground. Shops are matched to logos by the **hostname of the link**, which
  is what a visitor actually clicks.

---

## Signature intro

`components/SignatureSplash.tsx` writes the author's real signature artwork on a
`var(--bg)` canvas: a left-to-right ink reveal with a travelling pen-glow, the sub-line
and rule underneath. The whole write-on timeline is **CSS**, so it is the first thing
painted and it animates before hydration.

- It holds for **4.2s**, then fades: the mark and copy ebb away and the panel itself
  cross-fades off the page underneath — no black-out, no second reveal.
- It runs **once per tab session** (`sessionStorage: fg-intro-played`), and a click, key,
  wheel or touch skips it — so the intro never stands between a visitor and a
  one-click page change.
- The fade is duplicated on a CSS timer, so if JavaScript is late (or absent) the panel
  clears itself at ~7s instead of holding a locked splash. The scroll lock is applied
  from JavaScript only, never server-rendered, for the same reason.
- `prefers-reduced-motion` never sees it at all.

The full site is painted underneath from the first paint (nothing remounts when the
overlay leaves, and fonts/images are warm), which is what makes the hand-over a plain
cross-fade.

## Background film

The ambient backdrop's nature scene is a **looping video**: the author's supplied clip,
re-encoded to a silent, seamless H.264 loop (`public/video/ambient-loop.mp4`, moov atom
first) with a poster frame so it paints instantly.

```bash
npm i --no-save ffmpeg-static          # or put ffmpeg on PATH
npm run build:ambient -- "path/to/clip.mp4"
```

The script (source of truth for the asset) trims the clip, cross-fades the last second
into the first so the loop has no hard cut, strips audio, and writes both files.

The film sits at the **base of the ambient stack**: the aurora glow, wash, orbs, mist,
leaves, stars and meteors all still paint above it, the palette's own veil tints it
(see `filmVeil` above), and it keeps the same pointer-driven 3D parallax translate the drawn
scene had.

- It is **not on the critical path**: it hydrates no slower with it blocked than with it
  served.
- `prefers-reduced-motion` pauses it (the poster frame remains), and it pauses while the
  tab is hidden.

## Review source logos

Every review card names where the quote came from with **that outlet's own logo** — the
artwork the outlet publishes for itself — instead of initials.

- `config/reviewSources.ts` maps the `platform` printed in `config/siteData.ts` to an
  asset in `public/sources/` (Amazon and Barnes & Noble wordmarks, the Dorrance
  Publishing wordmark and its illustrator mark, Singing Dragon, Kirkus, Foreword
  Reviews, Biblio, Booknews, epinions). Files were downloaded from the source sites
  themselves and are served as-is, never hot-linked.
- Matching is on the **outlet**, never on the URL host: reviews are routinely quoted on a
  publisher's or the author's page, so host matching would credit the wrong site.
- Sources we hold no artwork for (ICNM Journal, a blog review) fall back to a neutral
  initials tile, and `full` mode adds the outlet's name beside the badge.

## Brand assets

`public/brand/logo-amber.png` (header/footer), `app/favicon.ico`, `app/icon.png` and
`app/apple-icon.png` were generated from the supplied author SVG
(`scripts/brand-source.svg`) by extracting the embedded artwork and converting its
luminance to alpha. Regenerate or replace the PNGs to update the mark; the header
(`components/SiteHeader.tsx`) references `/brand/logo-amber.png`.

`public/images/author-enhanced.jpg` is stored at 1400 px wide (251 KB) — the portrait is
never laid out above 340 CSS px, so this still covers a 4× display and keeps four
megabytes out of the repository and out of every image-optimizer request.

---

## Content pipeline

`config/siteData.ts` is the single source of content (typed). To review the live legacy
site before making content edits:

```bash
npm run sync:content
```

This prints headings, paragraphs, list items, and outbound links for all seven legacy
pages. It is a **review tool**, not a build dependency — production never scrapes.

**Verified purchase destinations:**

- *Managing Depression with Qigong* — Amazon Kindle + Singing Dragon (publisher)
- *Qigong as an Alternative and Complimentary Treatment for Depression* — Amazon + MoreBooks.de

> Note: the reference mock's titles "Return to Abracadabra" and "How to Ride a Unicorn"
> are **not** published here because they could not be verified as Dr. Gaik works.

## 3D hero & fallbacks

`components/HeroBook.tsx` renders a floating open-book (React Three Fiber) with theme-colored
particles and pedestal on desktop with WebGL. It automatically falls back to a static
CSS book on mobile (`max-width: 768px`), when WebGL is unavailable, or when the user
prefers reduced motion — preserving battery and avoiding layout shift.

## Accessibility

- Semantic landmarks (`header`, `main`, `footer`, `nav`), single `h1` per page
- Keyboard: visible focus rings, Escape closes dialogs/menus, focus moves into the book dialog
- `aria-current` navigation state, `aria-modal` dialogs, labelled icon buttons
- The phone navigation floats as a pill and slides away while reading downward, so it never
  covers the line being read; store buttons are labelled links whose logo carries alt text
- `prefers-reduced-motion` disables gradients sweeps, ambient motion, splash, tilt, and counters
- Color tokens are hand-tuned for contrast in every palette

## Performance notes

- All routes are **static** (`○` in the build report); no route reads request data.
- Fonts are self-hosted through `next/font/google`, so there is no render-blocking
  request to a font CDN and no text reflow while they load.
- `app/loading.tsx` gives every navigation an immediate route-level frame while the
  next page streams in.
- Below-the-fold client subtrees on the home page (`BookShowcase`, `ReviewWall`) are
  `next/dynamic` imports: still server-rendered for the first paint, but their JS
  arrives in its own chunk instead of blocking the hero.
- `components/RouteWarmup.tsx` warms every nav route on idle, so the first click on any
  page resolves from cache (production only — Next.js disables prefetching in dev).
- `data-scroll-behavior="smooth"` on `<html>` keeps in-page anchors smooth while letting
  Next.js skip the scroll animation on route changes, so a click lands immediately.
- The intro's dismissal never waits on hydration (see above), and the ambient glow is
  CSS-only (no JS per frame).
- The share card and icons are served from `public/` with an explicit edge-cache header
  (`next.config.mjs`), so a crawler fetch never wakes a function.
- `next.config.mjs` also sets baseline hardening headers (`X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) on every response.

> Running `npm run build` while `npm run dev` is live rewrites `.next` and breaks the
> dev server's stylesheet — restart the dev server afterwards.

## Deployment (Vercel)

Zero-config and no environment variables required. Import the repository at
[vercel.com/new](https://vercel.com/new); the production domain is
`lifecoachdoc.vercel.app`. Set `NEXT_PUBLIC_SITE_URL` only if the site ever moves to
another origin — it drives canonical URLs, the sitemap and the share card.

For self-hosting: `npm run build && npm run start`.

After a deploy, verify it end to end:

```bash
npm run check:production -- https://lifecoachdoc.vercel.app
```

## Tech

Next.js 15 · React 19 · TypeScript (strict) · Framer Motion (code-split, below the fold) ·
React Three Fiber + drei (`components/HeroBook.tsx`, currently unused by any route) ·
`next/font` self-hosted Manrope / Plus Jakarta Sans / DM Mono · Playwright (dev-only
content sync + production verification) · `sharp` (social card + asset pipeline) ·
CSS custom-property design system (no UI framework)

## Source & attribution

Clinical text © Dr. Frances Gaik (lifecoachdoc.net). Review excerpts © their stated
publications. This redesign is a presentation layer; medical content is informational
and not a substitute for professional care.
