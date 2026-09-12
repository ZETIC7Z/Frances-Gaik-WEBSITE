/**
 * BROWSER ICON
 * ---------------------------------------------------------------------------
 * Builds the site's icons from the author's supplied mark
 * (`scripts/favicon-source.png` — the meditating figure in its sun disc, cut out
 * on transparency) so the browser tab, the bookmark and the installed app icon
 * all show the real mark instead of a placeholder.
 *
 *   npm run build:favicon
 *
 * Writes:
 *   app/favicon.ico      16/32/48/64/128/256, PNG-compressed entries
 *   app/icon.png         modern browsers, transparency kept
 *   app/apple-icon.png   iOS home screen, flattened on paper so the disc is not
 *                        framed in black
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'scripts', 'favicon-source.png');

/** Sizes stored inside the .ico (a 256 entry is written as 0, per the format). */
const ICO_SIZES = [16, 32, 48, 64, 128, 256];

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

const resize = (size, opaque = false) => {
  const base = sharp(readFileSync(SOURCE)).resize(size, size, {
    fit: 'contain',
    background: opaque ? { r: 255, g: 255, b: 255, alpha: 1 } : transparent,
  });
  return (opaque ? base.flatten({ background: '#ffffff' }) : base).png({ compressionLevel: 9 }).toBuffer();
};

const entries = await Promise.all(ICO_SIZES.map((size) => resize(size)));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // ICO
header.writeUInt16LE(entries.length, 4);

let offset = header.length + entries.length * 16;
const directory = entries.map((png, index) => {
  const size = ICO_SIZES[index];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});

writeFileSync(join(ROOT, 'app', 'favicon.ico'), Buffer.concat([header, ...directory, ...entries]));
writeFileSync(join(ROOT, 'app', 'icon.png'), await resize(192));
writeFileSync(join(ROOT, 'app', 'apple-icon.png'), await resize(180, true));

console.log(`wrote app/favicon.ico (${ICO_SIZES.join('/')}), app/icon.png, app/apple-icon.png`);
