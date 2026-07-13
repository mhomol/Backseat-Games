/**
 * Flood-clear cream BG from plane body + prop drafts; write critter assets.
 * Body: no propeller. Props: two angles overlaid on the nose at runtime.
 */
import { mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CURSOR_ASSETS = join(
  process.env.USERPROFILE ?? '',
  '.cursor/projects/c-Users-MikeHomol-Development-Homol-Works-Homol-Rides/assets',
);
const REPLICATE = join(process.env.USERPROFILE ?? '', 'Pictures/Replicate');
const OUT = join(ROOT, 'assets/branding/critters');
const DRAFTS = join(ROOT, 'assets/branding/drafts/v11-recraft');

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

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

async function main() {
  await mkdir(REPLICATE, { recursive: true });
  await mkdir(OUT, { recursive: true });
  await mkdir(DRAFTS, { recursive: true });

  const bodySrc = join(CURSOR_ASSETS, 'plane-body-v2.png');
  const propSrc = join(CURSOR_ASSETS, 'plane-prop-diag.png');
  if (!existsSync(bodySrc) || !existsSync(propSrc)) {
    throw new Error(`Missing drafts: ${bodySrc} / ${propSrc}`);
  }

  const bodyCleared = await trimTransparent(await floodClear(await sharp(bodySrc).png().toBuffer()));
  // Keep body aspect similar to prior plane (~wider than tall); don't force square.
  const bodyOut = await sharp(bodyCleared)
    .resize(880, 560, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const propCleared = await trimTransparent(await floodClear(await sharp(propSrc).png().toBuffer()));
  // Square prop canvases so rotation stays centered on the hub.
  const propBase = await sharp(propCleared)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const prop1 = propBase;
  const prop2 = await sharp(propBase)
    .rotate(90, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const ts = stamp();
  const bodyRep = join(REPLICATE, `${ts}_plane-body.png`);
  const prop1Rep = join(REPLICATE, `${ts}_plane-prop-a.png`);
  const prop2Rep = join(REPLICATE, `${ts}_plane-prop-b.png`);
  await sharp(bodyOut).toFile(bodyRep);
  await sharp(prop1).toFile(prop1Rep);
  await sharp(prop2).toFile(prop2Rep);

  // Promote into live critters (body replaces plane.png; keep plane-2 as unused companion for now).
  await sharp(bodyOut).toFile(join(OUT, 'plane.png'));
  await sharp(prop1).toFile(join(OUT, 'plane-prop-1.png'));
  await sharp(prop2).toFile(join(OUT, 'plane-prop-2.png'));

  // Draft copies for provenance.
  await copyFile(bodySrc, join(DRAFTS, 'plane-body-noprop.png'));
  await copyFile(propSrc, join(DRAFTS, 'plane-prop-diag.png'));

  console.log(JSON.stringify({ bodyRep, prop1Rep, prop2Rep, out: OUT }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
