/**
 * Generate Travel Bingo per-item icons (animals + signs) via Recraft V4.
 *
 * Usage:
 *   node scripts/generate-bingo-item-icons.mjs --pilot
 *   node scripts/generate-bingo-item-icons.mjs
 *   node scripts/generate-bingo-item-icons.mjs --ids=cow,deer,stop-sign
 *   node scripts/generate-bingo-item-icons.mjs --placeholders-only
 */

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ITEMS_JSON = join(ROOT, 'src/data/bingo-items.json');
const PROMPTS_PATH = join(__dirname, 'brand-prompts.json');
const DRAFTS = join(ROOT, 'assets/branding/drafts/v11-bingo-items');
const OUT_DIR = join(ROOT, 'assets/bingo-icons/items');
const MODEL = 'recraft-ai/recraft-v4';
const PILOT_IDS = ['cow', 'deer', 'squirrel', 'stop-sign', 'yield-sign', 'traffic-light'];

function isBg(r, g, b, a) {
  if (a < 16) return true;
  const cream = Math.abs(r - 255) + Math.abs(g - 248) + Math.abs(b - 238) < 50;
  const white = r >= 235 && g >= 232 && b >= 225;
  return cream || white;
}

async function floodClearPng(buf) {
  const sharp = (await import('sharp')).default;
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
  return sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .resize(512, 512, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function buildPrompt(item, _styleBlock) {
  return (
    `Square mobile game bingo icon for a family road-trip app. ` +
    `Subject ONLY: ${item.label}. Category hint: ${item.category}. ` +
    `One clear centered subject filling most of the square, readable at tiny UI size. ` +
    `Vibrant cheerful cartoon vector style, bold black outlines, flat colors, subtle texture. ` +
    `Soft cream background #FFF8EE. ` +
    `NO pink car, NO highway, NO wooden signpost collage, NO mountains collage, NO text, NO letters, NO watermark.`
  );
}

async function generateOne(item, styleBlock, token) {
  const res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt: buildPrompt(item, styleBlock),
        aspect_ratio: '1:1',
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`${item.id}: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  if (data.status !== 'succeeded' || !data.output) {
    throw new Error(`${item.id} failed: ${data.error ?? data.status}`);
  }
  const url = Array.isArray(data.output) ? data.output[0] : data.output;
  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Download ${item.id} failed`);
  return Buffer.from(await imgRes.arrayBuffer());
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function writePlaceholders(items) {
  const sharp = (await import('sharp')).default;
  await mkdir(OUT_DIR, { recursive: true });
  const buf = await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 255, g: 248, b: 238, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  for (const item of items) {
    await writeFile(join(OUT_DIR, `${item.id}.png`), buf);
  }
  console.log(`Wrote ${items.length} placeholders to ${OUT_DIR}`);
}

async function writeItemImagesModule(items) {
  const lines = items.map(
    (item) => `  '${item.id}': require('../../assets/bingo-icons/items/${item.id}.png'),`,
  );
  const body = `import type { ImageSourcePropType } from 'react-native';

/** Per-item Travel Bingo icons (animals + signs). Other categories use category art. */
export const bingoItemImages: Record<string, ImageSourcePropType> = {
${lines.join('\n')}
};
`;
  await writeFile(join(ROOT, 'src/data/bingoItemImages.ts'), body);
  console.log('Wrote src/data/bingoItemImages.ts');
}

async function main() {
  const args = process.argv.slice(2);
  const pilot = args.includes('--pilot');
  const placeholdersOnly = args.includes('--placeholders-only');
  const idsArg = args.find((a) => a.startsWith('--ids='));
  const filterIds = idsArg ? idsArg.split('=')[1].split(',') : null;

  const allItems = JSON.parse(await readFile(ITEMS_JSON, 'utf8'));
  const targetItems = allItems.filter((item) => item.category === 'animals' || item.category === 'signs');
  let selected = targetItems;
  if (pilot) selected = targetItems.filter((item) => PILOT_IDS.includes(item.id));
  if (filterIds) selected = targetItems.filter((item) => filterIds.includes(item.id));

  await writePlaceholders(targetItems.filter((item) => {
    try {
      const st = statSync(join(OUT_DIR, `${item.id}.png`));
      return st.size < 1000;
    } catch {
      return true;
    }
  }));
  await writeItemImagesModule(targetItems);
  if (placeholdersOnly) return;

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.error('Set REPLICATE_API_TOKEN to generate icons.');
    process.exit(1);
  }

  const config = JSON.parse(await readFile(PROMPTS_PATH, 'utf8'));
  await mkdir(DRAFTS, { recursive: true });
  const replicateDir = join(process.env.USERPROFILE || process.env.HOME || '', 'Pictures', 'Replicate');
  await mkdir(replicateDir, { recursive: true });

  for (const item of selected) {
    process.stdout.write(`${item.id}... `);
    let attempt = 0;
    for (;;) {
      try {
        attempt += 1;
        const raw = await generateOne(item, config.styleBlock, token);
        const draftPath = join(DRAFTS, `${item.id}.webp`);
        await writeFile(draftPath, raw);
        const cleared = await floodClearPng(raw);
        await writeFile(join(OUT_DIR, `${item.id}.png`), cleared);
        const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, (m) => (m === 'T' ? '_' : ''));
        await writeFile(join(replicateDir, `${stamp}_${item.id}.png`), cleared);
        console.log('ok');
        await sleep(1500);
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (attempt < 4 && /429|rate/i.test(msg)) {
          console.log(`rate-limited, retry ${attempt}`);
          await sleep(8000 * attempt);
          continue;
        }
        console.log(`FAIL ${msg}`);
        break;
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
