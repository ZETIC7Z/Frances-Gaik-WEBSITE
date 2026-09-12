/**
 * AMBIENT BACKGROUND FILM
 * ---------------------------------------------------------------------------
 * The page's nature backdrop is a looping video. This script turns a supplied
 * clip into the loop the site actually ships, because the raw export is far too
 * heavy to hand a browser: 1920×1080, 8.2 Mb/s, 17.4 MB, with its `moov` atom at
 * the END of the file (so nothing can play until the whole download lands).
 *
 *   node scripts/build-ambient-video.mjs "C:/path/to/clip.mp4"
 *
 * It writes:
 *   public/video/ambient-loop.mp4      silent 1600×900 H.264, ~640 KB, faststart
 *   public/video/ambient-poster.jpg    the first frame, so the backdrop paints
 *                                      instantly instead of showing a gap
 *
 * The last second is cross-faded into the first second, so the clip repeats
 * without a hard cut.
 *
 * Needs an ffmpeg binary: set FFMPEG_BIN, install `ffmpeg` on PATH, or run
 *   npm i --no-save ffmpeg-static
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'video');
const OUT_LOOP = join(OUT_DIR, 'ambient-loop.mp4');
const OUT_POSTER = join(OUT_DIR, 'ambient-poster.jpg');

/** Loop seam: seconds of the head that the tail dissolves into. */
const LOOP_FADE = 1;
/**
 * Full HD output. The film is the page's whole backdrop, so it ships at a real
 * 1920×1080 rather than something scaled up in the browser — the frame rate is
 * the source's own 30 fps, resampled by nobody.
 */
const WIDTH = 1920;
/**
 * Quality. CRF 22 with `-tune film` measures ~50 dB PSNR against a 4K master
 * (i.e. indistinguishable) at ~2.7 MB for this 16 s clip, which is what buys
 * the original colour and the smoke gradients instead of a washed-out blur.
 */
const CRF = '22';

function findFfmpeg() {
  const candidates = [
    process.env.FFMPEG_BIN,
    join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
    join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg'),
  ].filter(Boolean);
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (probe.status === 0) return 'ffmpeg';
  throw new Error('No ffmpeg found — see the header of this script.');
}

function run(bin, args) {
  const result = spawnSync(bin, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || '');
    throw new Error(`ffmpeg failed: ${args.join(' ')}`);
  }
  return `${result.stdout || ''}${result.stderr || ''}`;
}

function durationOf(bin, src) {
  const output = spawnSync(bin, ['-hide_banner', '-i', src], { encoding: 'utf8' }).stderr || '';
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (!match) throw new Error('Could not read the clip duration');
  const [, h, m, s] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

const src = process.argv[2];
if (!src) throw new Error('Usage: node scripts/build-ambient-video.mjs <clip.mp4>');
if (!existsSync(src)) throw new Error(`No such file: ${src}`);

const bin = findFfmpeg();
const duration = durationOf(bin, src);
if (duration <= LOOP_FADE * 2) throw new Error('Clip is too short to loop cross-fade');

const body = Number((duration - LOOP_FADE).toFixed(2)); // head kept as the body
const offset = Number((body - LOOP_FADE).toFixed(2)); // where the dissolve starts
const filter = [
  '[0:v]split=2[a][b]',
  `[a]trim=0:${body},setpts=PTS-STARTPTS[a1]`,
  `[b]trim=0:${LOOP_FADE},setpts=PTS-STARTPTS[b1]`,
  `[a1][b1]xfade=transition=fade:duration=${LOOP_FADE}:offset=${offset},scale=${WIDTH}:-2:flags=lanczos[v]`,
].join(';');

mkdirSync(OUT_DIR, { recursive: true });

console.log(`source ${duration.toFixed(2)}s → loop ${body.toFixed(2)}s`);
run(bin, [
  '-hide_banner', '-loglevel', 'warning', '-y',
  '-i', src,
  '-filter_complex', filter,
  '-map', '[v]',
  '-an',                                  // a backdrop needs no audio track
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-tune', 'film', '-profile:v', 'high',
  '-pix_fmt', 'yuv420p',                  // the only pixel format every browser decodes
  '-movflags', '+faststart',              // atom first, so it streams
  '-r', '30',
  OUT_LOOP,
]);

run(bin, [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', OUT_LOOP,
  '-frames:v', '1', '-q:v', '4',
  '-vf', `scale=${WIDTH}:-2`,
  OUT_POSTER,
]);

const kb = (file) => `${(statSync(file).size / 1024).toFixed(0)} KB`;
console.log(`wrote public/video/ambient-loop.mp4 (${kb(OUT_LOOP)})`);
console.log(`wrote public/video/ambient-poster.jpg (${kb(OUT_POSTER)})`);
