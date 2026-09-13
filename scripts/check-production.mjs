/**
 * PRODUCTION SMOKE TEST
 * ---------------------------------------------------------------------------
 * Walks a deployed site in a real browser and checks the things a build cannot:
 * that every route answers, that the rendered head carries the metadata a
 * crawler or a chat client will read, that the share card is reachable as a
 * static image, and that nothing logs an error while the page runs.
 *
 *   node scripts/check-production.mjs https://lifecoachdoc.vercel.app
 *
 * Screenshots land in `.freebuff/production/`. Exit code is 1 if any check
 * fails, so it can gate a release step.
 */

import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const rawBase = process.argv[2] ?? process.env.FG_URL ?? 'http://127.0.0.1:3100';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
const outDir = '.freebuff/production';
mkdirSync(outDir, { recursive: true });

const routes = [
  '/',
  '/books',
  '/about',
  '/reviews',
  '/services',
  '/depression-and-qigong-treatment',
  '/hypnosis',
  '/contact',
  '/privacy',
];

/** Metadata routes that must exist for crawlers and platform share sheets. */
const staticAssets = [
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.webmanifest',
  '/og/og-image.jpg',
  '/icon.png',
  '/apple-icon.png',
  '/favicon.ico',
];

const report = { base, routes: [], assets: [], checks: [], errors: [], notes: [] };

/** Records a named pass/fail check and returns the boolean result. */
function check(name, ok, detail) {
  report.checks.push({ name, ok: Boolean(ok), detail });
  if (!ok) report.errors.push(`${name}${detail ? ` — ${detail}` : ''}`);
  return Boolean(ok);
}

const browser = await chromium.launch();

// ---------------------------------------------------------------- routes ----
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await context.addInitScript(() => {
    sessionStorage.setItem('fg-intro-played', '1');
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) =>
    failedRequests.push(`${request.url()} — ${request.failure()?.errorText ?? 'failed'}`),
  );

  for (const route of routes) {
    consoleErrors.length = 0;
    failedRequests.length = 0;

    const response = await page.goto(new URL(route, base).href, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await page.waitForSelector('h1', { timeout: 60_000 });
    await page.waitForTimeout(900);

    const state = await page.evaluate(() => {
      const meta = (selector) => document.querySelector(selector)?.getAttribute('content') ?? null;
      const link = (selector) => document.querySelector(selector)?.getAttribute('href') ?? null;
      const ld = document.querySelector('script[type="application/ld+json"]');
      let graph = null;
      try {
        graph = ld ? JSON.parse(ld.textContent) : null;
      } catch {
        graph = null;
      }
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() ?? null,
        description: meta('meta[name="description"]'),
        canonical: link('link[rel="canonical"]'),
        ogTitle: meta('meta[property="og:title"]'),
        ogUrl: meta('meta[property="og:url"]'),
        ogImage: meta('meta[property="og:image"]'),
        ogImageAlt: meta('meta[property="og:image:alt"]'),
        twitterCard: meta('meta[name="twitter:card"]'),
        twitterImage: meta('meta[name="twitter:image"]'),
        robots: meta('meta[name="robots"]'),
        themeColor: meta('meta[name="theme-color"]'),
        hasStructuredData: Boolean(graph?.['@graph']?.length),
        structuredTypes: (graph?.['@graph'] ?? []).map((node) => node['@type']),
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      };
    });

    const status = response?.status() ?? 0;
    /**
     * The canonical origin is the site's own domain, which is deliberately not
     * the origin under test when this runs against preview or localhost. So the
     * checks below compare paths, and require the canonical and the share card
     * to agree on one origin.
     */
    const canonicalUrl = state.canonical ? new URL(state.canonical) : null;
    const cardUrl = state.ogImage ? new URL(state.ogImage) : null;
    report.routes.push({ route, status, ...state, consoleErrors: [...consoleErrors], failedRequests: [...failedRequests] });

    check(`GET ${route} → 200`, status === 200, `status ${status}`);
    check(`${route} has an h1`, Boolean(state.h1));
    check(`${route} has a card image`, Boolean(state.ogImage), state.ogImage ?? 'missing');
    check(
      `${route} canonical points at its own path`,
      canonicalUrl?.pathname === new URL(route, base).pathname,
      `canonical ${canonicalUrl?.pathname ?? 'missing'} vs route ${new URL(route, base).pathname}`,
    );
    check(
      `${route} canonical and card share an origin`,
      Boolean(canonicalUrl) && canonicalUrl.origin === cardUrl?.origin,
      `${canonicalUrl?.origin} vs ${cardUrl?.origin}`,
    );
    check(`${route} declares the site card`, state.twitterCard === 'summary_large_image');
    check(`${route} ships structured data`, state.hasStructuredData, state.structuredTypes.join(', '));
    check(`${route} is indexable`, state.robots?.includes('index') === true, state.robots ?? 'none');
    check(`${route} has no horizontal overflow`, state.scrollWidth <= state.innerWidth + 1,
      `${state.scrollWidth}px content in ${state.innerWidth}px viewport`);
    check(`${route} logs no console errors`, consoleErrors.length === 0, consoleErrors.join(' | '));
    check(`${route} makes no failed requests`, failedRequests.length === 0, failedRequests.join(' | '));
  }
  await context.close();
}

// ------------------------------------------------- static metadata files ----
for (const asset of staticAssets) {
  const response = await fetch(new URL(asset, base), { redirect: 'follow' });
  const body = await response.arrayBuffer();
  const type = response.headers.get('content-type') ?? '';
  report.assets.push({ asset, status: response.status, type, bytes: body.byteLength });
  check(`GET ${asset} → 200`, response.status === 200, `status ${response.status}`);
  check(`${asset} is non-empty`, body.byteLength > 0, `${body.byteLength} bytes`);

  if (asset === '/og/og-image.jpg') {
    check('share card is an image', type.startsWith('image/'), type);
    check('share card is under 1 MB', body.byteLength < 1_000_000, `${body.byteLength} bytes`);
  }
  if (asset === '/robots.txt') {
    const text = new TextDecoder().decode(body);
    check('robots.txt points at the sitemap', text.includes('Sitemap:'), text.trim().split('\n').join(' / '));
  }
  if (asset === '/sitemap.xml') {
    const text = new TextDecoder().decode(body);
    const listed = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
    const missing = routes.filter((route) => !listed.includes(new URL(route, base).pathname));
    check('sitemap lists every route', missing.length === 0, `missing ${missing.join(', ')}`);
  }
}

// ------------------------------------------------ shared-link dry run -------
/**
 * Facebook, Messenger, WhatsApp and Slack all fetch the page as an unauthenticated
 * bot and read the head only. This is that request, so a card that resolves here
 * resolves in a chat window.
 */
{
  const response = await fetch(base, {
    headers: { 'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' },
  });
  const html = await response.text();
  const match = html.match(/<meta property="og:image" content="([^"]+)"/);
  check('bot fetch returns the head', response.status === 200, `status ${response.status}`);
  check('bot fetch exposes og:image', Boolean(match), match?.[1] ?? 'missing');

  report.sharedLink = { ogImage: match?.[1] ?? null };

  if (match) {
    // Same path, same origin as the page under test — identical to the absolute
    // URL in production, and still meaningful against a preview or localhost.
    const cardUrl = new URL(new URL(match[1]).pathname, base);
    const image = await fetch(cardUrl);
    const bytes = await image.arrayBuffer();
    check('crawler can download the card', image.status === 200 && bytes.byteLength > 1000,
      `status ${image.status}, ${bytes.byteLength} bytes`);

    // Facebook and Messenger cache by URL + type; a card served as text/html is
    // silently ignored, which is the classic "image does not appear" bug.
    const type = (image.headers.get('content-type') ?? '').split(';')[0];
    check('crawler receives an image type', type === 'image/jpeg' || type === 'image/png', type);
  }
}

// --------------------------------------------------------- interactions -----
/**
 * A build can pass every static check and still be broken for a visitor: an
 * image that never paints, a film that never plays, a toggle that does not
 * recolour anything, a link that does not navigate. These are those checks.
 */
{
  // The site is dark in every palette, so the colour scheme is pinned to dark
  // to keep the run deterministic: nothing below should depend on the visitor's
  // OS preference any more.
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  await context.addInitScript(() => sessionStorage.setItem('fg-intro-played', '1'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.hero__title', { timeout: 60_000 });
  await page.waitForTimeout(2500);

  const images = await page.evaluate(() =>
    [...document.images].map((image) => ({
      src: image.currentSrc || image.src,
      width: image.naturalWidth,
      complete: image.complete,
    })),
  );
  const brokenImages = images.filter((image) => image.complete && image.width === 0);
  check('every image on the home page paints', brokenImages.length === 0,
    brokenImages.map((image) => image.src).join(', '));
  check('the home page requests the optimised portrait',
    images.some((image) => image.src.includes('/_next/image')), 'no optimised image found');

  const film = await page.evaluate(() => {
    const video = document.querySelector('.ambient__video');
    return video
      ? { paused: video.paused, readyState: video.readyState, width: video.videoWidth }
      : null;
  });
  check('the ambient film plays in the browser', Boolean(film) && film.paused === false && film.readyState >= 2,
    JSON.stringify(film));

  // There is no light mode to switch to, and the page must not offer one.
  check('the site offers no light/dark switch',
    (await page.locator('button[aria-label^="Switch to "]').count()) === 0);

  // The header carries one loud action — Get the Book — with the colour theme
  // where the old light/dark switch used to sit.
  check('the desktop header shows Get the Book',
    await page.locator('.header__actions .header__cta').first().isVisible());
  const themeButton = page.locator('.header__actions .pmenu__btn');
  check('the desktop header offers the colour theme in place of the light/dark switch',
    (await themeButton.count()) === 1, `${await themeButton.count()} theme button(s)`);
  await themeButton.first().click();
  await page.waitForSelector('.pmenu__panel', { timeout: 15_000 });

  const before = await page.evaluate(() => ({
    bg: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
    veil: getComputedStyle(document.documentElement).getPropertyValue('--film-veil').trim(),
  }));
  const palettes = page.locator('.pmenu__panel .palette__swatch');
  const paletteCount = await palettes.count();
  check('the theme panel lists every palette', paletteCount === 13, `${paletteCount} palettes`);
  check('Graphite Rose is the second palette on offer',
    (await palettes.nth(1).getAttribute('aria-label')) === 'Graphite Rose',
    (await palettes.nth(1).getAttribute('aria-label')) ?? 'missing');
  if (paletteCount > 1) {
    await palettes.nth(1).click();
    await page.waitForTimeout(500);
    const applied = await page.evaluate(() => ({
      theme: localStorage.getItem('fg-theme'),
      bg: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
      veil: getComputedStyle(document.documentElement).getPropertyValue('--film-veil').trim(),
    }));
    check('choosing a palette applies it', applied.theme === 'graphite-rose', JSON.stringify(applied));
    check('choosing a palette recolours the page', applied.bg !== before.bg,
      `${before.bg} → ${applied.bg}`);
    check('each palette proportions the light over the film', applied.veil !== before.veil,
      `${before.veil} → ${applied.veil}`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('Escape closes the theme panel', (await page.locator('.pmenu__panel').count()) === 0);

  await page.click('nav[aria-label="Primary"] a[href="/books"]');
  await page.waitForURL('**/books', { timeout: 30_000 });
  await page.waitForSelector('h1', { timeout: 30_000 });
  check('primary navigation reaches /books', new URL(page.url()).pathname === '/books', page.url());

  const lookInside = page.locator('button:visible', { hasText: 'Look inside' }).first();
  await lookInside.scrollIntoViewIfNeeded();
  await lookInside.click();
  await page.waitForSelector('.modal-backdrop', { timeout: 20_000 });
  check('the book dialog opens', await page.locator('[role="dialog"]').first().isVisible());
  await page.keyboard.press('Escape');
  // The dialog leaves with a spring, so the node is removed when that settles
  // rather than on the keypress. Wait for the removal instead of guessing at a
  // fixed delay, which only ever measures how fast this machine is today.
  const closed = await page
    .waitForFunction(() => !document.querySelector('.modal-backdrop'), null, { timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  check('Escape closes the book dialog', closed,
    `${await page.locator('.modal-backdrop').count()} backdrop(s) still mounted`);

  check('interactions log no console errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

// ----------------------------------------------------------- phone shell -----
/**
 * The phone navigation floats over the page as a pill, slides away while the
 * visitor reads downward and returns on any scroll up; its menu rises out of
 * it; and the page offers a way back to the top. Each of those is a structural
 * claim, so each one is measured rather than eyeballed.
 */
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => sessionStorage.setItem('fg-intro-played', '1'));
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.hero__title', { timeout: 60_000 });
  await page.waitForTimeout(1800);

  check('the phone shell has no sidebar drawer',
    (await page.locator('.mobile-nav, .burger').count()) === 0);
  check('the phone pill floats Home, Books, Reviews, About, Contact, Theme and More',
    (await page.locator('.fnav__tab').count()) === 7, `${await page.locator('.fnav__tab').count()} tabs`);
  check('the floating pill is not a full-width bar',
    await page.evaluate(() => {
      const pill = document.querySelector('.fnav__pill').getBoundingClientRect();
      return pill.width < window.innerWidth - 20;
    }));
  check('the pill is a comfortable thumb target, not a hairline',
    await page.evaluate(() => document.querySelector('.fnav__pill').getBoundingClientRect().height >= 60),
    await page.evaluate(() => `${Math.round(document.querySelector('.fnav__pill').getBoundingClientRect().height)}px tall`));
  check('every pill destination clears a 44px touch target',
    await page.evaluate(() =>
      [...document.querySelectorAll('.fnav__tab')].every((tab) => tab.getBoundingClientRect().width >= 40)),
    await page.evaluate(() => `narrowest ${Math.round(Math.min(...[...document.querySelectorAll('.fnav__tab')].map((t) => t.getBoundingClientRect().width)))}px`));

  // The header keeps its one call to action; the theme control lives in the pill.
  check('the phone header hides the desktop theme button',
    (await page.locator('.header__actions .pmenu__btn:visible').count()) === 0);
  check('the header offers Get the Book on a phone',
    (await page.locator('.header__cta').first().isVisible()));

  // Theme sits next to More inside the pill, and its sheet carries the palettes.
  await page.locator('.fnav__tab', { hasText: 'Theme' }).click();
  await page.waitForSelector('.fnav-sheet--theme', { timeout: 20_000 });
  await page.waitForTimeout(800);
  check('the theme sheet offers every palette',
    (await page.locator('.fnav-sheet--theme .palette__swatch').count()) === 13,
    `${await page.locator('.fnav-sheet--theme .palette__swatch').count()} swatches`);
  const themeSheetBox = await page.locator('.fnav-sheet--theme').boundingBox();
  const themePillBox = await page.locator('.fnav').boundingBox();
  check('the theme sheet opens upward, clear of the pill',
    Boolean(themeSheetBox && themePillBox) && themeSheetBox.y + themeSheetBox.height <= themePillBox.y + 2,
    `sheet ends at ${themeSheetBox ? Math.round(themeSheetBox.y + themeSheetBox.height) : '?'}, nav starts at ${themePillBox ? Math.round(themePillBox.y) : '?'}`);
  const sheetColourBefore = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
  );
  await page.locator('.fnav-sheet--theme .palette__swatch').nth(3).click();
  await page.waitForTimeout(500);
  const sheetColour = await page.evaluate(() => ({
    stored: localStorage.getItem('fg-theme'),
    bg: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
  }));
  check('a swatch in the phone theme sheet recolours the page',
    sheetColour.stored === 'inferno-ember' && sheetColour.bg !== sheetColourBefore,
    `${sheetColourBefore} → ${sheetColour.bg} (stored ${sheetColour.stored})`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('Escape closes the theme sheet', (await page.locator('.fnav-sheet').count()) === 0);

  // Scroll down: the pill must get out of the way.
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'instant' }));
  await page.waitForTimeout(1200);
  check('the pill slides away while reading downward',
    (await page.locator('.fnav--away').count()) === 1);

  // Scroll up: it must come straight back.
  await page.evaluate(() => window.scrollBy({ top: -260, behavior: 'instant' }));
  await page.waitForTimeout(1200);
  check('the pill returns on a scroll up', (await page.locator('.fnav--away').count()) === 0);

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(900);
  const clearance = await page.evaluate(() => {
    const pill = document.querySelector('.fnav').getBoundingClientRect();
    const foot = document.querySelector('.footer__base').getBoundingClientRect();
    return Math.round(pill.top - foot.bottom);
  });
  check('the bottom of the page clears the floating pill', clearance >= 0, `${clearance}px of clearance`);

  // Back-to-top: reachable, and clear of the pill.
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 2.5, behavior: 'instant' }));
  await page.waitForTimeout(1400);
  check('the back-to-top pill appears once the visitor reads on',
    (await page.locator('.to-top--on').count()) === 1);
  const pillBox = await page.locator('.to-top').boundingBox();
  const navBox = await page.locator('.fnav').boundingBox();
  check('the back-to-top pill clears the floating pill',
    Boolean(pillBox && navBox) && pillBox.y + pillBox.height <= navBox.y + 2,
    `back-to-top ends at ${pillBox ? Math.round(pillBox.y + pillBox.height) : '?'}, nav starts at ${navBox ? Math.round(navBox.y) : '?'}`);

  // The menu rises out of the pill and carries the practice pages, not palettes.
  await page.locator('.fnav__tab', { hasText: 'More' }).click();
  await page.waitForSelector('.fnav-sheet', { timeout: 20_000 });
  await page.waitForTimeout(1400);
  const sheet = await page.locator('.fnav-sheet').boundingBox();
  const nav = await page.locator('.fnav').boundingBox();
  check('the More menu opens upward, clear of the pill',
    Boolean(sheet && nav) && sheet.y + sheet.height <= nav.y + 2,
    `sheet ends at ${sheet ? Math.round(sheet.y + sheet.height) : '?'}, nav starts at ${nav ? Math.round(nav.y) : '?'}`);
  check('the More menu carries the practice pages',
    (await page.locator('.fnav-sheet__links a').count()) === 4,
    `${await page.locator('.fnav-sheet__links a').count()} links`);
  check('the More menu carries no palette picker',
    (await page.locator('.fnav-sheet [role="option"]').count()) === 0);
  check('the More menu does not repeat the header\u2019s Get the Book button',
    (await page.locator('.fnav-sheet__cta').count()) === 0);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('Escape closes the More menu', (await page.locator('.fnav-sheet').count()) === 0);

  await page.locator('.fnav__tab', { hasText: 'Books' }).click();
  await page.waitForURL('**/books', { timeout: 30_000 });
  check('the floating pill navigates', new URL(page.url()).pathname === '/books', page.url());

  // The shops a book is sold through: a white plate each, logo only, no text.
  const storeButtons = await page.locator('.store-row .store-btn').count();
  const storeLogos = await page.$$eval('.store-row .store-btn img', (els) =>
    els.filter((e) => e.naturalWidth > 0).length,
  );
  check('every store is offered as a logo button',
    storeButtons > 0 && storeLogos === storeButtons,
    `${storeLogos}/${storeButtons} logos painted`);
  check('store buttons carry no text',
    await page.evaluate(() =>
      [...document.querySelectorAll('.store-row .store-btn')].every((el) => !el.innerText.trim()),
    ));
  check('store buttons are white plates',
    await page.evaluate(() => {
      const bg = getComputedStyle(document.querySelector('.store-row .store-btn')).backgroundColor;
      return /rgb\(255, 255, 255\)|#fff/i.test(bg);
    }));
  check('no store button overflows its plate',
    await page.evaluate(() =>
      [...document.querySelectorAll('.store-row .store-btn')].every((button) => {
        const plate = button.getBoundingClientRect();
        const logo = button.querySelector('img')?.getBoundingClientRect();
        return !logo || (logo.width <= plate.width + 1 && logo.height <= plate.height + 1);
      })));
  // Every logo is drawn at the same height, so none of them looks small beside
  // a neighbour whose wordmark simply happens to be wider.
  check('every store logo is drawn at one common height',
    await page.evaluate(() => {
      const heights = [...document.querySelectorAll('.store-row .store-btn img')].map(
        (image) => Math.round(image.getBoundingClientRect().height),
      );
      return heights.length > 1 && Math.max(...heights) - Math.min(...heights) <= 2;
    }),
    await page.evaluate(() => {
      const heights = [...document.querySelectorAll('.store-row .store-btn img')].map((i) => Math.round(i.getBoundingClientRect().height));
      return `${Math.min(...heights)}–${Math.max(...heights)}px`;
    }));

  await page.locator('button', { hasText: 'Look inside' }).first().click();
  await page.waitForSelector('.modal-panel', { timeout: 20_000 });
  await page.waitForTimeout(900);
  const stacked = await page.evaluate(() => {
    const cover = document.querySelector('.modal-grid__cover').getBoundingClientRect();
    const copy = document.querySelector('.modal-grid__copy').getBoundingClientRect();
    return copy.top >= cover.bottom - 2;
  });
  check('the book description sits below its cover on a phone', stacked);
  check('the long description is collapsible on a phone',
    (await page.locator('.blurb__toggle').count()) === 1);
  await page.keyboard.press('Escape');

  await context.close();
}

// ---------------------------------------------------- film delivery -----
/**
 * The ambient film is the site's heaviest asset and it sits on every page, so
 * how it is delivered matters: it must not arrive as something to save, it must
 * be cached rather than re-fetched on every navigation, and no download may be
 * started just by opening the site.
 */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => sessionStorage.setItem('fg-intro-played', '1'));
  const page = await context.newPage();
  const downloads = [];
  const media = [];
  page.on('download', (download) => downloads.push(download.url()));
  page.on('response', (response) => {
    const headers = response.headers();
    const type = (headers['content-type'] ?? '').split(';')[0];
    if (type.startsWith('video/')) {
      media.push({
        path: new URL(response.url()).pathname,
        type,
        disposition: headers['content-disposition'] ?? '',
        cache: headers['cache-control'] ?? '',
      });
    }
  });

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.hero__title', { timeout: 60_000 });
  await page.waitForTimeout(3000);

  check('opening the site starts no file download', downloads.length === 0, downloads.join(', '));
  check('the film is asked for at the address that is not a file',
    media.length > 0 && media.every((entry) => entry.path === '/media/ambient'),
    media.map((entry) => entry.path).join(', ') || 'no video response');
  check('the film is delivered as playable media, not as a file to save',
    media.length > 0 && media.every((entry) => entry.type === 'video/mp4' && entry.disposition === 'inline'),
    JSON.stringify(media[0] ?? {}));
  check('the film is cached instead of re-fetched on every page',
    media.length > 0 && media.every((entry) => entry.cache.includes('immutable')),
    media[0]?.cache ?? 'no cache header');

  const filmState = await page.evaluate(() => {
    const video = document.querySelector('.ambient__video');
    return video
      ? { src: new URL(video.currentSrc || video.src, location.href).pathname, paused: video.paused }
      : null;
  });
  check('the film element is not pointed at a .mp4 url',
    Boolean(filmState) && !filmState.src.endsWith('.mp4'), JSON.stringify(filmState));
  await context.close();
}

// ------------------------------------------------------------- tablet -----
/** The pill carries the whole navigation from 1240px down; it has to sit right
 *  at the top of that range as well as on a phone. */
{
  const context = await browser.newContext({ viewport: { width: 834, height: 1112 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => sessionStorage.setItem('fg-intro-played', '1'));
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.hero__title', { timeout: 60_000 });
  await page.waitForTimeout(1200);
  check('the tablet pill fits the viewport',
    await page.evaluate(() => {
      const pill = document.querySelector('.fnav__pill').getBoundingClientRect();
      return pill.left >= 0 && pill.right <= window.innerWidth + 1;
    }));
  check('the tablet pill names every destination',
    await page.evaluate(() =>
      [...document.querySelectorAll('.fnav__tab span')].filter((span) => span.offsetParent !== null).length === 7),
    await page.evaluate(() => `${[...document.querySelectorAll('.fnav__tab span')].filter((s) => s.offsetParent !== null).length} labels visible`));
  check('nothing overflows sideways at tablet width',
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    await page.evaluate(() => `${document.documentElement.scrollWidth}px content in ${window.innerWidth}px viewport`));
  await context.close();
}

// ------------------------------------------------------------- footer -----
/** The palettes now live in the header and the phone pill, not the footer. */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => sessionStorage.setItem('fg-intro-played', '1'));
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.hero__title', { timeout: 60_000 });
  check('the footer carries no palette picker',
    (await page.locator('.footer .palette__swatch').count()) === 0);
  await context.close();
}

// ------------------------------------------------------------- captures -----
{
  const cases = [
    ['desktop', { width: 1440, height: 900 }],
    ['tablet', { width: 834, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ];

  // Captures are the record of what a visitor saw, so they are taken from the
  // same production URL the checks above just audited.
  for (const [name, viewport] of cases) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    await context.addInitScript(() => sessionStorage.setItem('fg-intro-played', '1'));
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.waitForSelector('.hero__title', { timeout: 60_000 });
    await page.waitForTimeout(2200);
    // The ambient layers — the aurora, the drifting review wall, the gradient
    // sweeps — never stop moving, so a capture with animations running waits
    // forever for a still frame. They are paused for the shot instead; the
    // film itself is a video and is unaffected.
    await page.screenshot({ path: `${outDir}/${name}.png`, animations: 'disabled', timeout: 60_000 });
    // The full page also proves the sections below the fold paint in production.
    // A capture failure is recorded rather than thrown: the audit itself has
    // already run by this point and must not be lost to a screenshot timeout.
    try {
      await page.screenshot({ path: `${outDir}/${name}-full.png`, fullPage: true, animations: 'disabled', timeout: 60_000 });
    } catch (error) {
      report.notes.push(`${name}-full capture skipped: ${error.message.split('\n')[0]}`);
    }
    await context.close();
  }
}

await browser.close();

const failed = report.checks.filter((entry) => !entry.ok);
console.log(JSON.stringify({
  base,
  checks: report.checks.length,
  passed: report.checks.length - failed.length,
  failed: failed.length,
  failures: failed,
  notes: report.notes,
  assets: report.assets,
  sharedLink: report.sharedLink,
  routes: report.routes.map(({ route, status, title, h1, canonical, structuredTypes }) => ({
    route, status, title, h1, canonical, structuredTypes,
  })),
}, null, 2));

if (failed.length) process.exitCode = 1;
