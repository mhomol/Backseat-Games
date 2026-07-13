/**
 * Generate landmark scene PNGs for all jurisdictions in plates.json.
 *
 * Default: programmatic SVG placeholder (cream + tint band).
 * --replicate uses Recraft V4 landmark scenes (requires REPLICATE_API_TOKEN).
 *
 * Usage:
 *   node scripts/generate-plates.mjs
 *   node scripts/generate-plates.mjs --replicate
 *   node scripts/generate-plates.mjs --replicate --pilot
 *   node scripts/generate-plates.mjs --replicate --codes=GA,CA,AB,NY,TX
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PLATES_JSON = join(ROOT, 'src/data/plates.json');
const OUT_DIR = join(ROOT, 'assets/plates');
const DRAFTS = join(ROOT, 'assets/branding/drafts/v11-plate-landmarks');
const MODEL = 'recraft-ai/recraft-v4';
const WIDTH = 300;
const HEIGHT = 150;
const PILOT_CODES = ['GA', 'CA', 'AB', 'NY', 'TX'];

function shadeHex(hex, amount) {
  const n = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(n.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(n.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(n.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function plateSvg(plate) {
  const dark = shadeHex(plate.tint, -30);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7EC8F7"/>
      <stop offset="100%" stop-color="#FFF8EE"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
  <rect x="0" y="95" width="${WIDTH}" height="55" fill="${plate.tint}" opacity="0.55"/>
  <circle cx="240" cy="40" r="18" fill="#FFE08A" opacity="0.8"/>
  <rect x="20" y="70" width="90" height="40" rx="8" fill="${dark}" opacity="0.35"/>
</svg>`;
}

async function svgToPng(svg, outPath) {
  const sharp = (await import('sharp')).default;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
}

function buildPrompt(plate) {
  return (
    `Wide landscape 2:1 mobile game tile of ${plate.landmark} representing ${plate.name}. ` +
    `Full-bleed scenic landmark only. Vibrant cheerful cartoon vector style, bold black outlines, flat colors, subtle texture. ` +
    `Light sky blue #7EC8F7 sky with fluffy white clouds. ` +
    `NO pink car, NO wooden signpost, NO license plate frame, NO chrome border, NO bolts, ` +
    `NO text, NO letters, NO numbers, NO government seal, NO official logos, NO watermark.`
  );
}

async function generateViaRecraft(plate, token) {
  const res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt: buildPrompt(plate),
        aspect_ratio: '3:2',
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Replicate ${plate.code}: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  if (data.status !== 'succeeded' || !data.output) {
    throw new Error(`Replicate ${plate.code} failed: ${data.error ?? data.status}`);
  }
  const url = Array.isArray(data.output) ? data.output[0] : data.output;
  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Download ${plate.code} failed`);
  return Buffer.from(await imgRes.arrayBuffer());
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const useReplicate = process.argv.includes('--replicate');
  const pilot = process.argv.includes('--pilot');
  const codesArg = process.argv.find((a) => a.startsWith('--codes='));
  const filterCodes = codesArg
    ? codesArg.split('=')[1].split(',')
    : pilot
      ? PILOT_CODES
      : null;

  const plates = JSON.parse(await readFile(PLATES_JSON, 'utf8'));
  const selected = filterCodes
    ? plates.filter((p) => filterCodes.includes(p.code))
    : plates;

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(DRAFTS, { recursive: true });

  const token = process.env.REPLICATE_API_TOKEN;
  const replicateDir = join(process.env.USERPROFILE || process.env.HOME || '', 'Pictures', 'Replicate');
  if (useReplicate) await mkdir(replicateDir, { recursive: true });

  for (const plate of selected) {
    const outPath = join(OUT_DIR, `${plate.code}.png`);
    if (useReplicate) {
      if (!token) {
        console.error('Set REPLICATE_API_TOKEN for --replicate');
        process.exit(1);
      }
      process.stdout.write(`Recraft ${plate.code} (${plate.landmark})... `);
      let attempt = 0;
      for (;;) {
        try {
          attempt += 1;
          const buf = await generateViaRecraft(plate, token);
          await writeFile(join(DRAFTS, `${plate.code}.webp`), buf);
          const sharp = (await import('sharp')).default;
          await sharp(buf).resize(WIDTH, HEIGHT, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(outPath);
          const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, (m) => (m === 'T' ? '_' : ''));
          await writeFile(join(replicateDir, `${stamp}_plate-${plate.code}.png`), await readFile(outPath));
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
    } else {
      await svgToPng(plateSvg(plate), outPath);
      console.log(`SVG ${plate.code}`);
    }
  }

  console.log(`Done (${selected.length} plates).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
