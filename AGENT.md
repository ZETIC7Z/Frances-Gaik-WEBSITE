# AGENT.md — Project Guide & Agent Instructions

## 1. Project Overview
- **Project Name:** Dr. Frances Gaik — Author & Book Biography Website
- **Location:** `C:\Users\Administrator\Pictures\book author for antigrav`
- **Port:** Running on `http://localhost:4005` (Next.js 16, App Router)
- **Author:** Dr. Frances Gaik, Psy.D, LCPC (Willowbrook, IL)
- **Published Works:**
  - *Managing Depression with Qigong* (Singing Dragon / Jessica Kingsley Publishers)
  - *Dialogues from Beyond* (Dorrance Publishing Company)

---

## 2. Core Architecture & Styling Engine
- **CSS Architecture:** Pure BEM CSS in `app/globals.css` (No Tailwind).
- **Navigation:**
  - Floating pill navbar (`.fnav-pill`) with inner glass capsule (`.fnav-capsule`).
  - Active route indicator dot and spring hover pill (`layoutId="nav-hover-pill"`).
  - Theme Switcher with 4 color modes: `jade` (Botanical Jade), `sakura` (Cherry Blossom), `gold` (Golden Amber), `dusk` (Obsidian Dusk).
  - Mobile slide-down drawer (`.fnav-drawer`) with primary navigation, practice links, theme swatches, and "Get the Book" CTA.
- **Cinematic Signature Splash Intro:**
  - File: `components/SignatureSplash.tsx`.
  - Transparent dark veil overlay (`.splash__dark-veil`) sitting on top of `<AmbientBackground />` video loop (`/video/ambient-loop.mp4`).
  - Pure cursive signature writing animation (`/brand/logo-amber.png`) traced with a dynamic glowing traveling pen nib & spark particles.
  - No text clutter on splash screen.
  - Dismissable instantly on any click, touch, scroll, keyboard event, or "Skip Intro" button.
- **Mobile View Optimizations:**
  - Centered "Swipe down to discover" cue (`HeroScrollCue.tsx`) on mobile viewports.
  - Author photo hidden on mobile hero (`@media (max-width: 768px) .hero__author-reveal { display: none }`), redirecting visitors to `/about`.

---

## 3. FreeBuff & Tooling Integration
This project supports FreeBuff and autonomous agent tools:
- **Configuration Directory:** `.freebuff/`
- **Tool Profiles:**
  - `browser-debugger`: Automated Chrome DevTools inspection for layout and console verification.
  - `visual-regression`: Viewport testing across mobile (375px), tablet (768px), and desktop (1440px).
  - `content-sync`: Verifies author citations and store links against source data.

### Recommended Agent Skills:
1. `responsive-cross-device-optimization`: Ensure fluid viewport layouts and touch target sizing across iOS, Android, and desktop.
2. `web-3d-animation-design`: Maintain 3D perspective cards, canvas effects, and signature ink paths.
3. `frontend-design`: Maintain sophisticated, polished visual aesthetics avoiding generic AI templates.
4. `systematic-debugging`: Verify console logs, network requests, and CSS cascade rules before proposing changes.
5. `verification-before-completion`: Run `npm run build` and live browser checks before claiming tasks complete.

---

## 4. Key Commands
- **Dev Server:** `npx next dev -p 4005`
- **Production Build:** `npm run build`
- **Type Check:** `npx tsc --noEmit`
- **Content Sync:** `npm run sync:content`
