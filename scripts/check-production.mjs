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

const report = { base, routes: [], assets: [], checks: [], errors: [] };

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

// ------------------------------------------------------------- captures -----
{
  const cases = [
    ['desktop', { width: 1440, height: 900 }],
    ['tablet', { width: 834, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ];
  for (const [name, viewport] of cases) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    await context.addInitScript(() => sessionStorage.setItem('fg-intro-played', '1'));
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.waitForSelector('.hero__title', { timeout: 60_000 });
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${outDir}/${name}.png` });
    // The full page also proves the sections below the fold paint in production.
    await page.screenshot({ path: `${outDir}/${name}-full.png`, fullPage: true });
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
  assets: report.assets,
  sharedLink: report.sharedLink,
  routes: report.routes.map(({ route, status, title, h1, canonical, structuredTypes }) => ({
    route, status, title, h1, canonical, structuredTypes,
  })),
}, null, 2));

if (failed.length) process.exitCode = 1;
