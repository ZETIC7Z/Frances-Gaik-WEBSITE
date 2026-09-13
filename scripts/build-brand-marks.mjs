/**
 * BUILD BRAND MARKS — store and review-source logos
 * ---------------------------------------------------------------------------
 * Every shop a book can be bought from, and every outlet a review came from, is
 * shown with the brand's OWN logo artwork on a white plate. A wordmark is what
 * each of these brands actually publishes — a shop's square favicon says nothing
 * about which shop it is when it is 30px wide on a dark page — so the row of
 * buttons reads the way a reader recognises the stores.
 *
 * The artwork is TRIMMED of its own margins and RE-SCALED to one common content
 * height, then written to `public/`. That normalisation is the whole point: the
 * files arrive at wildly different sizes (a 1875px Barnes & Noble lockup next to
 * a 32px favicon), and without it some logos render tiny beside others even
 * though the CSS box is identical.
 *
 * Inputs, in order of preference, per brand:
 *   1. a file the author supplied (this repo's `assets/brand-src/`, then the
 *      machine's Downloads folder, then the brand's existing file in `public/`)
 *   2. the brand's own site (its homepage header logo, scraped for a logo asset)
 *   3. whatever is already committed — reported, never destroyed
 *
 * Run it to refresh a mark when a shop rebrands:
 *
 *   node scripts/build-brand-marks.mjs           # rebuild every logo
 *   node scripts/build-brand-marks.mjs --check    # report inputs, write nothing
 */

import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

/** Every logo is re-scaled so its artwork is this tall, in pixels. */
const CONTENT_H = 44;
/** …and never wider than this, so one enormous lockup cannot dominate. */
const CONTENT_W = 560;

/** Where hand-supplied artwork may live. `BRAND_SRC` overrides the whole list. */
const SUPPLIED_DIRS = process.env.BRAND_SRC
  ? [process.env.BRAND_SRC]
  : [
      'assets/brand-src',
      'public/sources',
      'public/stores',
      path.join(homedir(), 'Downloads'),
    ];

/**
 * `files` are tried against every supplied directory, in order; `site` is the
 * brand's own homepage, scraped for its header logo when nothing is supplied.
 */
const STORES = [
  { slug: 'amazon', name: 'Amazon', files: ['Amazon_logo.svg.png', 'Amazon_Amazon_2000-1024x491.png'], site: 'https://www.amazon.com' },
  { slug: 'ebay', name: 'eBay', files: ['Ebay-Logo-1.png', 'ebay.png'], site: 'https://www.ebay.com' },
  { slug: 'walmart', name: 'Walmart', files: ['Walmart-Logo.png', 'walmart.png'], site: 'https://www.walmart.com' },
  { slug: 'kobo', name: 'Rakuten Kobo', files: ['Rakuten_Kobo_Logo_2019.svg.webp', 'kobo.png'], site: 'https://www.kobo.com' },
  { slug: 'bookshop', name: 'Bookshop.org', files: ['Bookshop-Logo-Wide.png', 'bookshop.png'], site: 'https://bookshop.org' },
  { slug: 'hachette', name: 'Hachette UK', files: ['hachetteuk.png', 'hachette.png'], site: 'https://www.hachette.co.uk' },
  {
    slug: 'singing-dragon',
    name: 'Singing Dragon',
    files: ['SD_logo_-_landscape_left_-_RGB_black_9930726e-2e9a-4ce8-97e2-ce9ae4fd8fff.webp', 'singing-dragon.png'],
    site: 'https://us.singingdragon.com',
  },
  { slug: 'abebooks', name: 'AbeBooks', files: ['AbeBooks_logo.svg.webp', 'abebooks.png'], site: 'https://www.abebooks.com' },
  { slug: 'goodreads', name: 'Goodreads', files: ['goodreads.svg', 'goodreads.png'], site: 'https://www.goodreads.com' },
  { slug: 'dorrance', name: 'Dorrance Bookstore', files: ['dorrance.png'], site: 'https://bookstore.dorrancepublishing.com' },
  { slug: 'booktopia', name: 'Booktopia', files: ['Booktopia-logo.jpg', 'booktopia.png'], site: 'https://www.booktopia.com.au' },
];

const SOURCES = [
  { slug: 'amazon', name: 'Amazon', files: ['amazon.png'], site: 'https://www.amazon.com' },
  { slug: 'kirkus', name: 'Kirkus Reviews', files: ['kirkus.svg', 'kirkus.png'], site: 'https://www.kirkusreviews.com' },
  { slug: 'foreword', name: 'Foreword Reviews', files: ['foreword.svg', 'foreword.png'], site: 'https://www.forewordreviews.com' },
  // No artwork is held for these two outlets and neither publishes a reusable
  // logo; their cards name the outlet on the same white plate instead.
  { slug: 'booknews', name: 'Booknews.com', files: [], site: null },
  { slug: 'icnm', name: 'ICNM Journal', files: [], site: null },
  {
    slug: 'singing-dragon',
    name: 'Singing Dragon',
    files: ['singing-dragon.png'],
    site: 'https://us.singingdragon.com',
  },
  { slug: 'dorrance', name: 'Dorrance Publishing', files: ['dorrance.png'], site: 'https://bookstore.dorrancepublishing.com' },
  { slug: 'barnes-and-noble', name: 'Barnes & Noble', files: ['barnes-and-noble.png'], site: 'https://www.barnesandnoble.com' },
  { slug: 'biblio', name: 'Biblio.com', files: ['biblio.png'], site: 'https://www.biblio.com' },
  { slug: 'epinions', name: 'epinions.com', files: ['epinions.png'], site: 'https://www.epinions.com' },
];

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

/**
 * The first supplied file that is a real, usable image, with where it came from.
 * A file merely *named* like a logo is not enough: saving a web page as
 * `goodreads.png` is an easy mistake, and it must not be rasterised as if it
 * were artwork.
 */
async function findSupplied(brand) {
  for (const file of brand.files) {
    for (const dir of SUPPLIED_DIRS) {
      const candidate = path.join(dir, file);
      if (!existsSync(candidate)) continue;
      const bytes = readFileSync(candidate);
      try {
        const meta = await sharp(bytes, { density: 300 }).metadata();
        if (meta.width && meta.height && meta.width >= 80 && meta.width > meta.height * 1.2) {
          return { bytes, note: `supplied (${dir}/${file})` };
        }
        console.log(`  ${brand.slug.padEnd(16)} skipping ${dir}/${file} (${meta.width}x${meta.height})`);
      } catch {
        console.log(`  ${brand.slug.padEnd(16)} skipping ${dir}/${file} (not an image)`);
      }
    }
  }
  return null;
}


/**
 * The brand's own header logo, taken from its homepage markup. Brands change
 * these paths freely, so the file is verified as a real image before use, and
 * the result is written into the repo rather than hot-linked at runtime.
 */
async function findOnSite(url) {
  const response = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const pattern = /(?:src|data-src|content)=["']([^"']*(?:logo|wordmark)[^"']*\.(?:svg|png|webp|jpe?g))[^"']*["']/gi;
  const seen = new Set();
  for (const match of html.matchAll(pattern)) {
    let src = match[1];
    if (seen.has(src)) continue;
    seen.add(src);
    if (src.startsWith('//')) src = `https:${src}`;
    else if (src.startsWith('/')) src = new URL(src, url).toString();
    else if (!/^https?:/.test(src)) src = new URL(src, url).toString();
    try {
      const image = await fetch(src, { headers: { 'user-agent': UA } });
      if (!image.ok) continue;
      const bytes = Buffer.from(await image.arrayBuffer());
      const meta = await sharp(bytes).metadata();
      // A usable wordmark is wide, and large enough to survive scaling.
      if (meta.width && meta.height && meta.width >= 90 && meta.width > meta.height * 1.6) {
        return { bytes, note: `site (${new URL(src).host})` };
      }
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error('no logo asset found on site');
}

async function normalise(input) {
  const trimmed = await sharp(input, { density: 300 })
    .rotate()
    // These marks are drawn as dark ink for a light ground; the plate they sit
    // on is white, so any transparency is flattened onto that same white and
    // the two become one seamless surface.
    .flatten({ background: '#ffffff' })
    .trim({ threshold: 12 })
    .toBuffer();

  const meta = await sharp(trimmed).metadata();
  const scale = CONTENT_H / (meta.height ?? CONTENT_H);
  const width = Math.round((meta.width ?? CONTENT_H) * scale);
  const target = width > CONTENT_W ? CONTENT_W : CONTENT_H;
  const tmeta = await sharp(trimmed).metadata();
  const resize =
    width > CONTENT_W
      ? { width: CONTENT_W, height: Math.max(1, Math.round(((tmeta.height ?? 1) * CONTENT_W) / (tmeta.width ?? 1))) }
      : { width, height: CONTENT_H };

  return {
    out: await sharp(trimmed)
      .resize(resize.width, resize.height, { fit: 'contain', background: '#ffffff' })
      .png({ compressionLevel: 9 })
      .toBuffer(),
    size: resize,
  };
}

async function build(brand, outFile, check) {
  const supplied = await findSupplied(brand);
  let source = supplied;
  if (!source && brand.site) {
    try {
      source = await findOnSite(brand.site);
    } catch {
      source = null;
    }
  }

  const label = `  ${brand.slug.padEnd(16)}`;

  if (!source) {
    const held = existsSync(outFile) ? 'kept existing file' : 'MISSING';
    console.log(`${label} no input found — ${held}`);
    return existsSync(outFile);
  }

  if (check) {
    console.log(`${label} ${source.note}`);
    return true;
  }

  const { out, size } = await normalise(source.bytes ?? readFileSync(source.file));
  writeFileSync(outFile, out);
  console.log(`${label} ${`${size.width}x${size.height}`.padEnd(9)} ${source.note}`);
  return true;
}

const check = process.argv.includes('--check');
mkdirSync('public/stores', { recursive: true });
mkdirSync('public/sources', { recursive: true });

console.log(check ? 'brand logos (nothing will be written)' : 'brand logos written');
console.log(`white plates, content height ${CONTENT_H}px`);
console.log('buy-from logos:');
for (const brand of STORES) await build(brand, `public/stores/${brand.slug}.png`, check);
console.log('review-source logos:');
for (const brand of SOURCES) await build(brand, `public/sources/${brand.slug}.png`, check);

