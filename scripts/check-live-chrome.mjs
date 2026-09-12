import { chromium } from 'playwright';
import fs from 'node:fs';

const cdpUrl = process.env.BU_CDP_URL ?? 'http://localhost:9222';
const baseUrl = process.env.FG_URL ?? 'http://127.0.0.1:50444/';
const outputDir = '.freebuff/live-chrome';
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.connectOverCDP(cdpUrl);
const context = browser.contexts()[0] ?? await browser.newContext();
let page = context.pages().find((candidate) => candidate.url().startsWith(baseUrl)) ?? context.pages()[0];
if (!page) page = await context.newPage();

const errors = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') errors.push(`${message.type()}: ${message.text()}`);
});
page.on('requestfailed', (request) => errors.push(`request: ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`));

await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('.hero__title', { timeout: 120000 });
await page.evaluate(() => {
  try { sessionStorage.setItem('fg-intro-played', '1'); } catch {}
});
await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('.hero__title', { timeout: 120000 });
await page.waitForTimeout(1500);

const state = await page.evaluate(() => {
  const video = document.querySelector('.ambient__video');
  const film = document.querySelector('.ambient__film');
  const logo = document.querySelector('.brand__logo');
  const favicon = [...document.querySelectorAll('link[rel~="icon"]')].map((link) => ({ href: link.href, sizes: link.getAttribute('sizes') }));
  return {
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
    scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    video: video && film ? {
      src: video.currentSrc,
      readyState: video.readyState,
      paused: video.paused,
      currentTime: video.currentTime,
      duration: video.duration,
      intrinsic: { width: video.videoWidth, height: video.videoHeight },
      videoRect: video.getBoundingClientRect().toJSON(),
      filmRect: film.getBoundingClientRect().toJSON(),
      objectFit: getComputedStyle(video).objectFit,
      objectPosition: getComputedStyle(video).objectPosition,
      filmOpacity: getComputedStyle(film).opacity,
    } : null,
    logo: logo ? { rect: logo.getBoundingClientRect().toJSON(), cssWidth: getComputedStyle(logo).width, cssHeight: getComputedStyle(logo).height } : null,
    favicon,
    splash: Boolean(document.querySelector('.splash')),
    bodyLocked: document.body.classList.contains('is-splashing'),
  };
});

await page.screenshot({ path: `${outputDir}/desktop.png`, fullPage: false });
await page.evaluate(() => window.scrollTo(0, document.querySelector('.hero')?.getBoundingClientRect().top ?? 0));
await page.waitForTimeout(1500);
const after = await page.evaluate(() => {
  const video = document.querySelector('.ambient__video');
  return video ? { paused: video.paused, currentTime: video.currentTime } : null;
});

console.log(JSON.stringify({ cdpUrl, state, after, errors }, null, 2));
if (errors.some((error) => error.includes('pageerror') || error.includes('console: error'))) process.exitCode = 1;
await browser.close();
