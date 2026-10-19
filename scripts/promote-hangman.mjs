/**
 * Flood-clear cream BG from Hangman doodle drafts; write transparent PNGs.
 * Stand layers keep the full canvas (no trim) so they register.
 * Body parts trim after flood so HangmanDrawing can compose them.
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPLICATE = join(process.env.USERPROFILE ?? '', 'Pictures/Replicate');
const OUT = join(ROOT, 'assets/branding/hangman');
const DRAFTS = join(ROOT, 'assets/branding/drafts');

function isBg(r, g, b, a, slack = 55) {
  if (a < 16) return true;
  return Math.abs(r - 255) + Math.abs(g - 248) + Math.abs(b - 238) < slack;
}

async function floodClear(buf, slack = 55) {
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
    if (!isBg(data[o], data[o + 1], data[o + 2], data[o + 3], slack)) return;
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

/** Salt-and-pepper cream leftover in yarn hair after the edge flood. */
async function despeckle(buf, passes = 5) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  for (let p = 0; p < passes; p++) {
    const kill = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (data[i * 4 + 3] < 16) continue;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            if (data[(ny * w + nx) * 4 + 3] >= 16) n++;
          }
        }
        if (n < 3) kill.push(i);
      }
    }
    for (const i of kill) data[i * 4 + 3] = 0;
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
}

/** Drop leftover hair-grain islands that are not attached to the drawing. */
async function dropSmallOpaqueIslands(buf, minSize = 80) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const seen = new Uint8Array(w * h);
  const opaque = (i) => data[i * 4 + 3] >= 16;
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || !opaque(start)) continue;
    const stack = [start];
    const blob = [];
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop();
      blob.push(i);
      const x = i % w;
      const y = (i / w) | 0;
      const nbs = [i + 1, i - 1, i + w, i - w];
      const ok = [x + 1 < w, x > 0, y + 1 < h, y > 0];
      for (let k = 0; k < 4; k++) {
        if (!ok[k] || seen[nbs[k]] || !opaque(nbs[k])) continue;
        seen[nbs[k]] = 1;
        stack.push(nbs[k]);
      }
    }
    if (blob.length < minSize) {
      for (const i of blob) data[i * 4 + 3] = 0;
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
}

/** Keep the face (largest cream blob); drop cream halo around hair. */
async function keepLargestCreamBlob(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const seen = new Uint8Array(w * h);
  const creamAt = (i) => {
    const o = i * 4;
    if (data[o + 3] < 16) return false;
    return Math.abs(data[o] - 255) + Math.abs(data[o + 1] - 248) + Math.abs(data[o + 2] - 238) < 70;
  };
  let best = [];
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || !creamAt(start)) continue;
    const stack = [start];
    const blob = [];
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop();
      blob.push(i);
      const x = i % w;
      const y = (i / w) | 0;
      const nbs = [i + 1, i - 1, i + w, i - w];
      const ok = [x + 1 < w, x > 0, y + 1 < h, y > 0];
      for (let k = 0; k < 4; k++) {
        if (!ok[k] || seen[nbs[k]] || !creamAt(nbs[k])) continue;
        seen[nbs[k]] = 1;
        stack.push(nbs[k]);
      }
    }
    if (blob.length > best.length) best = blob;
  }
  const keep = new Uint8Array(w * h);
  for (const i of best) keep[i] = 1;
  for (let i = 0; i < w * h; i++) {
    if (!creamAt(i) || keep[i]) continue;
    data[i * 4 + 3] = 0;
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
}

/** Magenta join-edge becomes snow fill so two halves meet without an ink seam. */
async function replaceMagentaWithSnow(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const isMag = (o) => {
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    if (data[o + 3] < 16) return false;
    return r > 160 && r - g > 25 && b > g - 10 && b > 140;
  };
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (!isMag(o)) continue;
    const x = i % w;
    let sr = 248;
    let sg = 240;
    let sb = 228;
    for (let dx = 1; dx <= 8; dx++) {
      const nx = x - dx;
      if (nx < 0) break;
      const no = (i - dx) * 4;
      if (data[no + 3] < 16 || isMag(no)) continue;
      sr = data[no];
      sg = data[no + 1];
      sb = data[no + 2];
      break;
    }
    data[o] = sr;
    data[o + 1] = sg;
    data[o + 2] = sb;
    data[o + 3] = 255;
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
}

/** Wipe the inner join strip to snow so a D-half has no ink/magenta seam. */
async function paintRightJoinSnow(buf, strip = 14) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  let minX = w;
  let maxX = 0;
  let minY = h;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < 16) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const cx = Math.round((minX + maxX) / 2);
  const cy = Math.round((minY + maxY) / 2);
  const co = (cy * w + cx) * 4;
  const sr = data[co];
  const sg = data[co + 1];
  const sb = data[co + 2];
  const join = Math.max(strip, Math.round((maxX - minX) * 0.1));
  const fromX = Math.max(minX, maxX - join);
  const paint = (x, y) => {
    const o = (y * w + x) * 4;
    if (data[o + 3] < 16) return;
    data[o] = sr;
    data[o + 1] = sg;
    data[o + 2] = sb;
    data[o + 3] = 255;
  };
  for (let y = minY; y <= maxY; y++) {
    for (let x = fromX; x <= maxX; x++) paint(x, y);
  }
  const ink = { r: 28, g: 24, b: 22 };
  const thick = Math.max(3, Math.round((maxX - minX) * 0.014));
  for (let x = minX; x <= maxX; x++) {
    let bottom = -1;
    for (let y = maxY; y >= minY; y--) {
      if (data[(y * w + x) * 4 + 3] >= 16) {
        bottom = y;
        break;
      }
    }
    if (bottom < 0) continue;
    for (let t = 0; t < thick; t++) {
      const y = bottom - t;
      if (y < minY) break;
      const o = (y * w + x) * 4;
      if (data[o + 3] < 16) continue;
      data[o] = ink.r;
      data[o + 1] = ink.g;
      data[o + 2] = ink.b;
      data[o + 3] = 255;
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
}

const JOBS = [
  {
    src: '2026-10-17_1421_hangman-stand-base.jpg',
    out: 'stand-base.png',
    draft: 'hangman-stand-base.jpg',
    mode: 'register',
  },
  {
    src: '2026-10-17_1421_hangman-stand-post.jpg',
    out: 'stand-post.png',
    draft: 'hangman-stand-post.jpg',
    mode: 'register',
  },
  {
    src: '2026-10-17_1421_hangman-stand-beam.jpg',
    out: 'stand-beam.png',
    draft: 'hangman-stand-beam.jpg',
    mode: 'register',
  },
  {
    src: '2026-10-17_1421_hangman-stand-rope.jpg',
    out: 'stand-rope.png',
    draft: 'hangman-stand-rope.jpg',
    mode: 'register',
  },
  {
    src: '2026-10-17_1440_hangman-hitchhiker-head.jpg',
    out: 'hitchhiker-head.png',
    draft: 'hangman-hitchhiker-head.jpg',
    mode: 'part',
    keepLargestCream: true,
  },
  {
    src: '2026-10-17_1512_hangman-part-torso-jeans.jpg',
    out: 'hitchhiker-torso.png',
    draft: 'hangman-hitchhiker-torso.jpg',
    mode: 'part',
  },
  {
    src: '2026-10-17_1440_hangman-part-arm.jpg',
    out: 'hitchhiker-arm.png',
    draft: 'hangman-hitchhiker-arm.jpg',
    mode: 'part',
  },
  {
    src: '2026-10-17_1440_hangman-part-leg.jpg',
    out: 'hitchhiker-leg.png',
    draft: 'hangman-hitchhiker-leg.jpg',
    mode: 'part',
  },
  {
    src: '2026-10-17_2245_hangman-skeleton-head-v2.jpg',
    out: 'skeleton-head.png',
    draft: 'hangman-skeleton-head.jpg',
    mode: 'part',
    keepLargestCream: true,
  },
  {
    src: '2026-10-17_2245_hangman-skeleton-torso-v3.jpg',
    out: 'skeleton-torso.png',
    draft: 'hangman-skeleton-torso.jpg',
    mode: 'part',
  },
  {
    src: '2026-10-17_2234_hangman-skeleton-arm-v3.jpg',
    out: 'skeleton-arm.png',
    draft: 'hangman-skeleton-arm.jpg',
    mode: 'part',
  },
  {
    src: '2026-10-17_2234_hangman-skeleton-leg-v2.jpg',
    out: 'skeleton-leg.png',
    draft: 'hangman-skeleton-leg.jpg',
    mode: 'part',
  },
  {
    src: '2026-10-18_2058_hangman-pilgrim-head-v2.jpg',
    out: 'pilgrim-head.png',
    draft: 'hangman-pilgrim-head.jpg',
    mode: 'part',
    keepLargestCream: true,
  },
  {
    src: '2026-10-18_2050_hangman-pilgrim-torso-v3.jpg',
    out: 'pilgrim-torso.png',
    draft: 'hangman-pilgrim-torso.jpg',
    mode: 'part',
    islandMin: 400,
    bgSlack: 95,
  },
  {
    src: '2026-10-18_2058_hangman-pilgrim-arm-v4.jpg',
    out: 'pilgrim-arm.png',
    draft: 'hangman-pilgrim-arm.jpg',
    mode: 'part',
  },
  {
    src: '2026-10-18_2050_hangman-pilgrim-leg-v2.jpg',
    out: 'pilgrim-leg.png',
    draft: 'hangman-pilgrim-leg.jpg',
    mode: 'part',
  },
  {
    src: '2026-10-19_0806_hangman-snowman-head.jpg',
    out: 'snowman-head.png',
    draft: 'hangman-snowman-head.jpg',
    mode: 'part',
    keepLargestCream: true,
  },
  {
    src: '2026-10-19_0806_hangman-snowman-torso.jpg',
    out: 'snowman-torso.png',
    draft: 'hangman-snowman-torso.jpg',
    mode: 'part',
    keepLargestCream: true,
  },
  {
    src: '2026-10-19_0806_hangman-snowman-arm.jpg',
    out: 'snowman-arm.png',
    draft: 'hangman-snowman-arm.jpg',
    mode: 'part',
  },
  {
    src: '2026-10-19_0844_hangman-snowman-leg-v2.jpg',
    out: 'snowman-leg.png',
    draft: 'hangman-snowman-leg.jpg',
    mode: 'part',
    keepLargestCream: true,
    magentaSeal: true,
  },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(DRAFTS, { recursive: true });

  const only = process.argv[2];
  for (const job of JOBS) {
    if (only && !job.out.includes(only)) continue;
    const src = join(REPLICATE, job.src);
    await copyFile(src, join(DRAFTS, job.draft));
    let flooded = await floodClear(await sharp(src).png().toBuffer(), job.bgSlack ?? 55);
    const dest = join(OUT, job.out);
    if (job.mode === 'register') {
      await sharp(flooded)
        .resize(512, 684, { fit: 'fill' })
        .png({ compressionLevel: 9 })
        .toFile(dest);
    } else {
      flooded = await despeckle(flooded);
      if (job.magentaSeal) flooded = await replaceMagentaWithSnow(flooded);
      if (job.keepLargestCream) flooded = await keepLargestCreamBlob(flooded);
      if (job.magentaSeal) flooded = await replaceMagentaWithSnow(flooded);
      flooded = await dropSmallOpaqueIslands(flooded, job.islandMin ?? 80);
      let trimmed = await sharp(flooded).trim({ threshold: 10 }).png().toBuffer();
      if (job.magentaSeal) trimmed = await paintRightJoinSnow(trimmed);
      await sharp(trimmed)
        .resize(512, 512, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(dest);
    }
    console.log(dest);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
