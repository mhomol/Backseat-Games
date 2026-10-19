/**
 * Rasterize Hangman doodle layouts to a 512×684 compose PNG.
 * Keep numbers in sync with src/data/hangmanFigureLayout.ts.
 * Usage: node scripts/compose-hangman.mjs pilgrim
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'assets/branding/hangman');
const DRAFTS = join(ROOT, 'assets/branding/drafts');
const FRAME_W = 132;
const PREVIEW_W = 512;
const PREVIEW_H = 684;
const SCALE = PREVIEW_W / FRAME_W;
const HEAD = { left: 58, top: 18, width: 44, height: 40 };
const CREAM = { r: 255, g: 248, b: 238, alpha: 1 };

const hitchhikerBody = {
  torso: { dx: 5, dy: 37, width: 34, height: 54, zIndex: 3 },
  armLeft: { dx: -18.5, dy: 46, width: 32, height: 42, zIndex: 1, flipX: true },
  armRight: { dx: 29, dy: 45, width: 32, height: 42, zIndex: 1 },
  legLeft: {
    dx: -25.6,
    dy: 80,
    width: 42,
    height: 48,
    zIndex: 4,
    flipX: true,
    flipOnImage: true,
    rotate: -4,
  },
  legRight: {
    dx: 29,
    dy: 79,
    width: 42,
    height: 48,
    zIndex: 4,
    rotate: 4,
  },
};

const LAYOUTS = {
  hitchhiker: { ...hitchhikerBody },
  pilgrim: {
    ...hitchhikerBody,
    head: { dx: -6, dy: -22 + (55 * FRAME_W) / PREVIEW_W, width: 56, height: 64, zIndex: 5 },
    torso: { dx: 3, dy: 38, width: 38, height: 56, zIndex: 3 },
    armLeft: {
      dx: -18.5,
      dy: 46,
      width: 32,
      height: 42,
      zIndex: 1,
      flipX: true,
      flipY: true,
    },
    armRight: {
      dx: 29,
      dy: 45,
      width: 32,
      height: 42,
      zIndex: 1,
      flipY: true,
    },
    legLeft: {
      ...hitchhikerBody.legLeft,
      dy: 80 - (5 * FRAME_W) / PREVIEW_W,
    },
    legRight: {
      ...hitchhikerBody.legRight,
      dy: 79 - (4 * FRAME_W) / PREVIEW_W,
    },
  },
  snowman: {
    head: {
      dx: -12.2,
      dy: -8.2 + (25 * FRAME_W) / PREVIEW_W,
      width: 68.4,
      height: 68.4,
      zIndex: 5,
    },
    torso: { dx: -0.275, dy: 36.15, width: 44.55, height: 44.55, zIndex: 3 },
    armLeft: {
      dx: -19,
      dy: 48 - (70 * FRAME_W) / PREVIEW_W,
      width: 24,
      height: 20,
      zIndex: 4,
      flipX: true,
    },
    armRight: {
      dx: 39,
      dy: 48 - (70 * FRAME_W) / PREVIEW_W,
      width: 24,
      height: 20,
      zIndex: 4,
    },
    legLeft: { dx: -10, dy: 70, width: 40, height: 44, zIndex: 1 },
    legRight: { dx: 14, dy: 70, width: 40, height: 44, zIndex: 1, flipX: true },
  },
};

const PARTS = {
  hitchhiker: {
    head: 'hitchhiker-head.png',
    torso: 'hitchhiker-torso.png',
    arm: 'hitchhiker-arm.png',
    leg: 'hitchhiker-leg.png',
  },
  pilgrim: {
    head: 'pilgrim-head.png',
    torso: 'pilgrim-torso.png',
    arm: 'pilgrim-arm.png',
    leg: 'pilgrim-leg.png',
  },
  snowman: {
    head: 'snowman-head.png',
    torso: 'snowman-torso.png',
    arm: 'snowman-arm.png',
    leg: 'snowman-leg.png',
  },
};

function px(n) {
  return Math.round(n * SCALE);
}

async function layerPng(file, part) {
  let img = sharp(join(DIR, file));
  if (part.flipX) img = img.flop();
  if (part.flipY) img = img.flip();
  const deg = part.rotate ?? 0;
  if (deg) img = img.rotate(deg, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const buf = await img
    .resize(px(part.width), px(part.height), {
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? px(part.width);
  const h = meta.height ?? px(part.height);
  let left = px(HEAD.left + part.dx);
  let top = px(HEAD.top + part.dy);
  if (deg) {
    left -= Math.round((w - px(part.width)) / 2);
    top -= Math.round((h - px(part.height)) / 2);
  }
  return { input: buf, left, top };
}

/** Clip overflow instead of clamping origins (that flattened stand-base vs pole). */
async function placeOnCanvas({ input, left, top }) {
  const meta = await sharp(input).metadata();
  let w = meta.width ?? 0;
  let h = meta.height ?? 0;
  let extractLeft = 0;
  let extractTop = 0;
  if (left < 0) {
    extractLeft = -left;
    w -= extractLeft;
    left = 0;
  }
  if (top < 0) {
    extractTop = -top;
    h -= extractTop;
    top = 0;
  }
  if (left + w > PREVIEW_W) w = PREVIEW_W - left;
  if (top + h > PREVIEW_H) h = PREVIEW_H - top;
  if (w <= 0 || h <= 0) return null;
  const buf = await sharp(input)
    .extract({ left: extractLeft, top: extractTop, width: w, height: h })
    .png()
    .toBuffer();
  return { input: buf, left, top };
}

async function layerStand(file, topLayout) {
  const buf = await sharp(join(DIR, file))
    .resize(PREVIEW_W, PREVIEW_H, { fit: 'fill' })
    .png()
    .toBuffer();
  return { input: buf, left: 0, top: px(topLayout) };
}

async function main() {
  const character = process.argv[2] ?? 'pilgrim';
  const layout = LAYOUTS[character];
  const files = PARTS[character];
  if (!layout || !files) {
    throw new Error(`No doodle layout/parts for ${character}`);
  }
  const head = layout.head ?? {
    dx: 0,
    dy: 0,
    width: HEAD.width,
    height: HEAD.height,
    zIndex: 5,
  };
  const layers = [
    { z: 0, p: layerStand('stand-base.png', -5) },
    { z: 1, p: layerStand('stand-post.png', -10) },
    { z: 1, p: layerStand('stand-beam.png', -10) },
    { z: layout.armLeft.zIndex, p: layerPng(files.arm, layout.armLeft) },
    { z: layout.armRight.zIndex, p: layerPng(files.arm, layout.armRight) },
    { z: layout.torso.zIndex, p: layerPng(files.torso, layout.torso) },
    { z: layout.legLeft.zIndex, p: layerPng(files.leg, layout.legLeft) },
    { z: layout.legRight.zIndex, p: layerPng(files.leg, layout.legRight) },
    { z: head.zIndex ?? 5, p: layerPng(files.head, head) },
  ].sort((a, b) => a.z - b.z);

  const composites = [];
  for (const layer of layers) {
    const placed = await placeOnCanvas(await layer.p);
    if (placed) composites.push(placed);
  }

  const stamp = process.argv[3] ? `-${process.argv[3]}` : '';
  const out = join(DRAFTS, `hangman-${character}-compose-preview${stamp}.png`);
  await sharp({
    create: {
      width: PREVIEW_W,
      height: PREVIEW_H,
      channels: 4,
      background: CREAM,
    },
  })
    .composite(composites)
    .png()
    .toFile(out);
  console.log(out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
