/**
 * Generate stylized license plate PNGs for all jurisdictions in plates.json.
 *
 * Default: programmatic SVG → PNG (consistent, no API).
 * Optional: --replicate uses Replicate flux-schnell (requires REPLICATE_API_TOKEN).
 *
 * Usage:
 *   node scripts/generate-plates.mjs
 *   node scripts/generate-plates.mjs --replicate
 *   node scripts/generate-plates.mjs --codes TX,CA,NY
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PLATES_JSON = join(ROOT, 'src/data/plates.json');
const OUT_DIR = join(ROOT, 'assets/plates');

const WIDTH = 300;
const HEIGHT = 150;

function shadeHex(hex, amount) {
  const n = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(n.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(n.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(n.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function decorForCode(code) {
  const hash = [...code].reduce((a, c) => a + c.charCodeAt(0), 0);
  const variant = hash % 4;
  if (variant === 0) {
    return `<circle cx="42" cy="75" r="8" fill="currentAccent" opacity="0.35"/>
      <circle cx="258" cy="75" r="8" fill="currentAccent" opacity="0.35"/>`;
  }
  if (variant === 1) {
    return `<path d="M30 95 Q75 70 120 95" stroke="currentAccent" stroke-width="3" fill="none" opacity="0.4"/>
      <path d="M180 95 Q225 70 270 95" stroke="currentAccent" stroke-width="3" fill="none" opacity="0.4"/>`;
  }
  if (variant === 2) {
    return `<rect x="28" y="68" width="6" height="14" rx="2" fill="currentAccent" opacity="0.35"/>
      <rect x="266" y="68" width="6" height="14" rx="2" fill="currentAccent" opacity="0.35"/>`;
  }
  return `<polygon points="36,82 44,66 52,82" fill="currentAccent" opacity="0.35"/>
    <polygon points="248,82 256,66 264,82" fill="currentAccent" opacity="0.35"/>`;
}

function plateSvg(plate) {
  const { tint, region } = plate;
  const dark = shadeHex(tint, -30);
  const light = shadeHex(tint, 40);
  const decor = decorForCode(plate.code).replaceAll('currentAccent', tint);
  const bolts = region === 'CA'
    ? `<circle cx="24" cy="24" r="4" fill="#C0C0C0"/><circle cx="276" cy="24" r="4" fill="#C0C0C0"/>`
    : `<circle cx="24" cy="24" r="4" fill="#D4D4D4"/><circle cx="276" cy="24" r="4" fill="#D4D4D4"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#F5F0E6"/>
  <rect x="8" y="8" width="284" height="134" rx="14" fill="#FFFDF8" stroke="${tint}" stroke-width="6"/>
  <rect x="14" y="14" width="272" height="28" rx="6" fill="${dark}"/>
  <rect x="14" y="108" width="272" height="8" rx="3" fill="${light}" opacity="0.85"/>
  <rect x="14" y="48" width="272" height="54" rx="4" fill="#FFFDF8"/>
  ${decor}
  ${bolts}
  <rect x="130" y="58" width="40" height="34" rx="4" fill="${tint}" opacity="0.12"/>
</svg>`;
}

async function svgToPng(svg, outPath) {
  const sharp = (await import('sharp')).default;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
}

function buildPrompt(plate) {
  return (
    `Flat cartoon vehicle license plate illustration, fictional design inspired by ${plate.name}, ` +
    `accent color ${plate.tint}, white plate body, rounded corners, simple decorative border stripes, ` +
    `no text, no letters, no numbers, no government seal, no official logos, clean vector game art style, ` +
    `centered on plain cream background`
  );
}

async function generateViaReplicate(plate, token) {
  const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
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
        num_outputs: 1,
        output_format: 'png',
        output_quality: 85,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate ${plate.code}: ${res.status} ${err}`);
  }
  const data = await res.json();
  if (data.status !== 'succeeded' || !data.output?.[0]) {
    throw new Error(`Replicate ${plate.code} failed: ${data.error ?? data.status}`);
  }
  const imgRes = await fetch(data.output[0]);
  if (!imgRes.ok) throw new Error(`Download ${plate.code} failed`);
  return Buffer.from(await imgRes.arrayBuffer());
}

async function main() {
  const useReplicate = process.argv.includes('--replicate');
  const codesArg = process.argv.find((a) => a.startsWith('--codes='));
  const filterCodes = codesArg ? codesArg.split('=')[1].split(',') : null;

  const plates = JSON.parse(await readFile(PLATES_JSON, 'utf8'));
  const selected = filterCodes
    ? plates.filter((p) => filterCodes.includes(p.code))
    : plates;

  await mkdir(OUT_DIR, { recursive: true });

  const token = process.env.REPLICATE_API_TOKEN;

  for (const plate of selected) {
    const outPath = join(OUT_DIR, `${plate.code}.png`);
    if (useReplicate && token) {
      process.stdout.write(`Replicate ${plate.code}... `);
      const buf = await generateViaReplicate(plate, token);
      const sharp = (await import('sharp')).default;
      await sharp(buf).resize(WIDTH, HEIGHT, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(outPath);
      console.log('ok');
    } else {
      const svg = plateSvg(plate);
      await svgToPng(svg, outPath);
      console.log(`Generated ${plate.code}.png`);
    }
  }

  const mapLines = plates.map((p) => `  ${p.code}: require('../../assets/plates/${p.code}.png'),`);
  const mapPath = join(ROOT, 'src/data/plateImages.ts');
  await writeFile(
    mapPath,
    `import type { ImageSourcePropType } from 'react-native';\n\n` +
      `export const plateImageByCode: Record<string, ImageSourcePropType> = {\n` +
      `${mapLines.join('\n')}\n};\n`,
  );
  console.log(`Updated ${mapPath}`);
  console.log(`\nDone: ${selected.length} plates → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
