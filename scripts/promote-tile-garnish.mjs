/**
 * Flood-clear cream BG from tile garnish doodles; write transparent PNGs.
 */
import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPLICATE = join(process.env.USERPROFILE ?? '', 'Pictures/Replicate');
const OUT = join(ROOT, 'assets/branding/tile-garnish');
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

const JOBS = [
  {
    src: '2026-10-16_1116_tile-leaf-pile-v3.jpg',
    out: 'leaf-pile.png',
    draft: 'tile-leaf-pile.jpg',
  },
  {
    src: '2026-10-16_1112_tile-snow-drift-v2.jpg',
    out: 'snow-drift.png',
    draft: 'tile-snow-drift.jpg',
  },
  {
    src: '2026-10-16_1156_halloween-candy-pile.jpg',
    out: 'candy-pile.png',
    draft: 'tile-candy-pile.jpg',
  },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(DRAFTS, { recursive: true });
  for (const job of JOBS) {
    const src = join(REPLICATE, job.src);
    await copyFile(src, join(DRAFTS, job.draft));
    const flooded = await floodClear(await sharp(src).png().toBuffer());
    const trimmed = await sharp(flooded).trim({ threshold: 10 }).png().toBuffer();
    const dest = join(OUT, job.out);
    await sharp(trimmed)
      .resize(512, 320, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(dest);
    console.log(dest);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
