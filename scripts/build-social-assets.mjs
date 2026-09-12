/**
 * SOCIAL SHARE CARD + README CAPTURE
 * ---------------------------------------------------------------------------
 * Two presentation assets are derived from supplied screenshots, because the
 * raw exports are far too heavy to hand a crawler or a README:
 *
 *   node scripts/build-social-assets.mjs \
 *     --hero "hero.png" --capture "full-page.png"
 *
 * It writes:
 *   public/og/og-image.jpg  1200×630 share card (OpenGraph + Twitter), the exact
 *                           size Facebook, Messenger, LinkedIn, Slack, X and
 *                           WhatsApp expect for a large preview.
 *   docs/live-site.jpg      the README's live-site capture, downscaled.
 *
 * The share card is composed rather than cropped: the hero is letterboxed onto
 * a blurred, darkened copy of itself, so nothing is cut off (the portrait and
 * the headline both survive) and the padding reads as intentional framing
 * instead of a crop. Screenshots taken against `next dev` also carry the Next.js
 * dev-tools badge in the bottom-left corner, so `stripDevBadge` finds that badge
 * and paints it out with feathered pixels sampled just above it — nothing that
 * ships to a crawler or a README ever shows a development overlay.
 */

import { mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OG_OUT = join(ROOT, 'public', 'og', 'og-image.jpg');
const CAPTURE_OUT = join(ROOT, 'docs', 'live-site.jpg');

/**
 * Both assets ship as JPEG. The share card is a photograph of the page, so the
 * photo codec costs nothing visible, while a 4:4:4 JPEG is ~7× smaller than the
 * equivalent PNG (≈150 KB vs ≈1.05 MB) — which keeps the crawler fetch fast and
 * the repository light. `mozjpeg` + full chroma keeps the hero's fine text and
 * the card's gradients clean at this size.
 */
const JPEG = { quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true };

/** Canonical large-preview size (1.91:1) used by every major social network. */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
/** Side margin around the hero inside the card, and its corner radius. */
const OG_MARGIN = 24;
const OG_RADIUS = 20;
/** Caption printed in the card's lower band. */
const OG_CAPTION = 'lifecoachdoc.vercel.app';

/** Width of the README capture; keeps the PNG well under a megabyte. */
const CAPTURE_WIDTH = 1600;

const args = process.argv.slice(2);

function argValue(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

const keepBadge = args.includes('--keep-dev-badge');

/**
 * Locates the Next.js dev-tools badge: a small bright glyph on the smooth
 * bottom-left corner of the page, clear of the hero's chip row (which starts
 * further right). Returns its centre and a radius that covers the badge plate.
 */
async function findDevBadge(input) {
  const { width, height } = await sharp(input).metadata();
  const left = 0;
  const top = height - 90;
  const window = { left, top, width: Math.min(58, width), height: Math.min(90, height) };
  const { data, info } = await sharp(input).extract(window).raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  let minX = Infinity;
  let maxX = -1;
  let minY = Infinity;
  let maxY = -1;
  for (let y = 0; y < window.height; y += 1) {
    for (let x = 0; x < window.width; x += 1) {
      const i = (y * window.width + x) * channels;
      const luma = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (luma > 185) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < 0) return null;
  const glyph = Math.max(maxX - minX, maxY - minY) + 1;
  // Too large to be the badge glyph — leave the artwork alone.
  if (glyph > 26) return null;
  return {
    x: Math.round((minX + maxX) / 2) + left,
    y: Math.round((minY + maxY) / 2) + top,
    r: Math.min(22, Math.max(14, Math.round(glyph * 1.7))),
  };
}

/**
 * Mean luminance of a raw pixel buffer.
 */
function meanLuma({ data, info }) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    count += 1;
  }
  return count ? sum / count : 0;
}

/**
 * Paints a round region out with feathered pixels sampled just above it, then
 * nudges that patch onto the brightness of the backdrop it lands on. Without
 * the nudge the patch is visible as a faint disc, because the backdrop is a
 * gradient — a couple of levels darker 40 px further up.
 */
async function patchRegion(input, { x, y, r }) {
  const { width, height } = await sharp(input).metadata();
  const size = Math.round(r * 2);
  const left = Math.max(0, Math.round(x - r));
  const top = Math.max(0, Math.round(y - r));
  const sampleTop = Math.max(0, Math.round(y - r * 3));

  const patch = await sharp(input)
    .extract({
      left,
      top: sampleTop,
      width: Math.min(size, width - left),
      height: Math.min(size, height - sampleTop),
    })
    .resize(size, size)
    // Light blur only: the backdrop has grain, and a heavily smoothed patch is
    // more conspicuous than the overlay it hides.
    .blur(3)
    .png()
    .toBuffer();

  // The backdrop the patch lands on, sampled as a ring around the badge so the
  // badge's own pixels never contribute to the target brightness.
  const ring = Math.round(r * 2.4);
  const ringLeft = Math.max(0, Math.round(x - ring));
  const ringTop = Math.max(0, Math.round(y - ring));
  const ringRaw = await sharp(input)
    .extract({
      left: ringLeft,
      top: ringTop,
      width: Math.min(ring * 2, width - ringLeft),
      height: Math.min(ring * 2, height - ringTop),
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let ringSum = 0;
  let ringCount = 0;
  for (let row = 0; row < ringRaw.info.height; row += 1) {
    for (let col = 0; col < ringRaw.info.width; col += 1) {
      const dx = col - (x - ringLeft);
      const dy = row - (y - ringTop);
      const distance = Math.hypot(dx, dy);
      if (distance < r * 1.5 || distance > ring * 0.95) continue;
      const i = (row * ringRaw.info.width + col) * ringRaw.info.channels;
      ringSum += (ringRaw.data[i] + ringRaw.data[i + 1] + ringRaw.data[i + 2]) / 3;
      ringCount += 1;
    }
  }
  const target = ringCount ? ringSum / ringCount : 0;
  const current = meanLuma(await sharp(patch).raw().toBuffer({ resolveWithObject: true }));
  const delta = Math.max(-26, Math.min(26, target - current));

  const matched = await sharp(patch).linear(1, delta).png().toBuffer();
  const feathered = await sharp(matched)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
        ),
        blend: 'dest-in',
      },
    ])
    .blur(5)
    .png()
    .toBuffer();
  return sharp(input)
    .ensureAlpha()
    .composite([{ input: feathered, left, top }])
    .png()
    .toBuffer();
}

/** Removes the dev-tools badge when present; otherwise returns the input as-is. */
async function stripDevBadge(input) {
  if (keepBadge) return { buffer: input, badge: null };
  const badge = await findDevBadge(input);
  if (!badge) return { buffer: input, badge: null };
  return { buffer: await patchRegion(input, badge), badge };
}

/** Builds the 1200×630 share card. */
async function buildShareCard(heroPath) {
  const { buffer: hero, badge } = await stripDevBadge(heroPath);
  const { width, height } = await sharp(hero).metadata();
  const cardWidth = OG_WIDTH - OG_MARGIN * 2;
  const cardHeight = Math.round((cardWidth * height) / width);
  const cardTop = Math.round((OG_HEIGHT - cardHeight) / 2);

  const rounded = await sharp(hero)
    .resize(cardWidth, cardHeight)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${cardWidth}" height="${cardHeight}"><rect width="${cardWidth}" height="${cardHeight}" rx="${OG_RADIUS}" ry="${OG_RADIUS}" fill="#fff"/></svg>`,
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  // A drop shadow, built from the card's own silhouette so it follows the
  // rounded corners exactly rather than boxing them.
  const shadow = await sharp({
    create: {
      width: cardWidth,
      height: cardHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: rounded, blend: 'dest-in' }])
    .blur(18)
    .png()
    .toBuffer();

  const caption = Buffer.from(
    `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">` +
      `<text x="${OG_WIDTH / 2}" y="${OG_HEIGHT - Math.round((OG_HEIGHT - (cardTop + cardHeight)) / 2) - 7}" ` +
      `text-anchor="middle" font-family="Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif" ` +
      `font-size="23" font-weight="600" letter-spacing="1.6" fill="#EAF3F1" opacity="0.92">${OG_CAPTION}</text>` +
      `</svg>`,
  );

  const backdrop = await sharp(hero)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'centre' })
    .blur(26)
    .modulate({ brightness: 0.42, saturation: 0.85 })
    .png()
    .toBuffer();

  mkdirSync(dirname(OG_OUT), { recursive: true });
  await sharp(backdrop)
    .composite([
      { input: shadow, left: OG_MARGIN, top: cardTop + 14 },
      { input: rounded, left: OG_MARGIN, top: cardTop },
      { input: caption, left: 0, top: 0 },
    ])
    .jpeg(JPEG)
    .toFile(OG_OUT);

  return { cardHeight, badge, output: OG_OUT, bytes: statSync(OG_OUT).size };
}

/** Downscales the supplied full-page capture for the README. */
async function buildCapture(capturePath) {
  const { buffer: patched, badge } = await stripDevBadge(capturePath);
  const { height, width } = await sharp(patched).metadata();
  mkdirSync(dirname(CAPTURE_OUT), { recursive: true });
  await sharp(patched)
    .resize({ width: Math.min(CAPTURE_WIDTH, width), withoutEnlargement: true })
    .jpeg(JPEG)
    .toFile(CAPTURE_OUT);
  return { source: `${width}×${height}`, badge, output: CAPTURE_OUT, bytes: statSync(CAPTURE_OUT).size };
}

const heroPath = argValue('--hero');
const capturePath = argValue('--capture');
if (!heroPath && !capturePath) {
  console.error('Usage: node scripts/build-social-assets.mjs --hero <image> [--capture <image>] [--keep-dev-badge]');
  process.exit(1);
}

const report = {};
if (heroPath) report.shareCard = await buildShareCard(heroPath);
if (capturePath) report.capture = await buildCapture(capturePath);
console.log(JSON.stringify(report, null, 2));
