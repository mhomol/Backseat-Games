/**
 * Flood-clear cream BG from holiday critter drafts; write transparent PNGs.
 */
import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPLICATE = join(process.env.USERPROFILE ?? '', 'Pictures/Replicate');
const OUT = join(ROOT, 'assets/branding/critters');
const DRAFTS = join(ROOT, 'assets/branding/drafts');

function isBg(r, g, b, a) {
  if (a < 16) return true;
  const cream = Math.abs(r - 255) + Math.abs(g - 248) + Math.abs(b - 238) < 55;
  const white = r >= 232 && g >= 228 && b >= 218;
  return cream || white;
}

async function floodClear(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const visited = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (visited[i]) return;
    const o = i * 4;
    if (!isBg(data[o], data[o + 1], data[o + 2], data[o + 3])) return;
    visited[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    const y = (i / w) | 0;
    data[i * 4 + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
}

async function trimTransparent(buf) {
  return sharp(buf).trim({ threshold: 10 }).png({ compressionLevel: 9 }).toBuffer();
}

const JOBS = [
  {
    src: '2026-10-16_0940_christmas-dove-wings-up.jpg',
    out: 'dove-1.png',
    draft: 'dove-1.jpg',
    mode: 'square',
  },
  {
    src: '2026-10-16_0956_christmas-dove-wings-down-v2.jpg',
    out: 'dove-2.png',
    draft: 'dove-2.jpg',
    mode: 'square',
  },
  {
    src: '2026-10-16_0940_christmas-reindeer-peek.jpg',
    out: 'reindeer-up.png',
    draft: 'reindeer-up.jpg',
    mode: 'peek',
  },
  {
    src: '2026-10-16_0940_christmas-reindeer-wink.jpg',
    out: 'reindeer-wink.png',
    draft: 'reindeer-wink.jpg',
    mode: 'peek',
  },
  {
    src: '2026-10-16_1000_thanksgiving-fox-peek-v2.jpg',
    out: 'fox-up.png',
    draft: 'fox-up.jpg',
    mode: 'peek',
  },
  {
    src: '2026-10-16_0958_thanksgiving-fox-wink.jpg',
    out: 'fox-wink.png',
    draft: 'fox-wink.jpg',
    mode: 'peek',
  },
  {
    src: '2026-10-16_0956_thanksgiving-hot-air-balloon.jpg',
    out: 'balloon.png',
    draft: 'balloon.jpg',
    mode: 'tall',
  },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(DRAFTS, { recursive: true });

  for (const job of JOBS) {
    const src = join(REPLICATE, job.src);
    await copyFile(src, join(DRAFTS, job.draft));
    const flooded = await floodClear(await sharp(src).png().toBuffer());
    let outBuf;
    if (job.mode === 'peek') {
      outBuf = await sharp(flooded)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toBuffer();
    } else if (job.mode === 'tall') {
      const trimmed = await trimTransparent(flooded);
      outBuf = await sharp(trimmed)
        .resize(360, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toBuffer();
    } else {
      const trimmed = await trimTransparent(flooded);
      outBuf = await sharp(trimmed)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toBuffer();
    }
    const dest = join(OUT, job.out);
    await sharp(outBuf).toFile(dest);
    console.log(dest);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
