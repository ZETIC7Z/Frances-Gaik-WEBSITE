import { chromium } from 'playwright';

const BASE = process.env.FG_URL ?? 'http://127.0.0.1:3000/';
const report = { base: BASE, cases: [], errors: [] };
const browser = await chromium.launch();

const cases = [
  ['desktop', { width: 1440, height: 900 }],
  ['tablet', { width: 900, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
];

for (const [name, viewport] of cases) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => {
    localStorage.setItem('fg-theme', 'teal-ember');
    localStorage.setItem('fg-mode', 'dark');
    sessionStorage.setItem('fg-intro-played', '1');
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) => errors.push(`request: ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`));

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForSelector('.hero__title', { timeout: 120000 });
  await page.waitForTimeout(1200);

  const state = await page.evaluate(() => {
    const video = document.querySelector('.ambient__video');
    const film = document.querySelector('.ambient__film');
    const hero = document.querySelector('.hero');
    const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
    return {
      title: document.querySelector('h1')?.textContent?.trim() ?? null,
      splash: Boolean(document.querySelector('.splash')),
      bodyLocked: document.body.classList.contains('is-splashing'),
      overflow,
      video: video && film ? {
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        objectFit: getComputedStyle(video).objectFit,
        videoRect: video.getBoundingClientRect().toJSON(),
        filmWidth: film.getBoundingClientRect().width,
        filmHeight: film.getBoundingClientRect().height,
      } : null,
      heroHeight: hero?.getBoundingClientRect().height ?? 0,
    };
  });

  await page.screenshot({ path: `.freebuff/${name}-verification.png`, fullPage: false });
  report.cases.push({ name, viewport, state, errors });
  report.errors.push(...errors.map((error) => `${name}: ${error}`));
  await context.close();
}

// Route smoke test in one already-warm browser context.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(() => sessionStorage.setItem('fg-intro-played', '1'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  for (const route of ['/books', '/about', '/reviews', '/contact', '/']) {
    await page.goto(new URL(route, BASE).href, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForSelector('h1', { timeout: 120000 });
    report.cases.push({ route, heading: (await page.locator('h1').first().textContent())?.trim(), errors: [...errors] });
    errors.length = 0;
  }
  await context.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
