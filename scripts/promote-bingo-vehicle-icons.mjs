/**
 * Flood-clear cream BG from GenerateImage vehicle bingo drafts and promote to items/.
 * Usage: node scripts/promote-bingo-vehicle-icons.mjs
 */
import { mkdir, readdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CURSOR_ASSETS = join(
  process.env.USERPROFILE ?? '',
  '.cursor/projects/c-Users-MikeHomol-Development-Homol-Works-Homol-Rides/assets',
);
const REPLICATE = join(process.env.USERPROFILE ?? '', 'Pictures/Replicate');
const OUT = join(ROOT, 'assets/bingo-icons/items');
const DRAFTS_VEHICLES = join(ROOT, 'assets/branding/drafts/v11-bingo-vehicles');
const DRAFTS_SIGNS = join(ROOT, 'assets/branding/drafts/v11-bingo-signs');
const DRAFTS_ANIMALS = join(ROOT, 'assets/branding/drafts/v11-bingo-animals');

/** Map Cursor/filename slug -> bingo item id */
const SLUG_TO_ID = {
  'school-bus': 'school-bus',
  'fire-truck': 'fire-truck',
  'police-car': 'police-car',
  motorcycle: 'motorcycle',
  pickup: 'pickup-truck',
  'pickup-truck': 'pickup-truck',
  rv: 'rv',
  ambulance: 'ambulance',
  'semi-truck': 'semi-truck',
  convertible: 'convertible',
  'sports-car': 'sports-car',
  tractor: 'tractor',
  train: 'train',
  airplane: 'airplane',
  helicopter: 'helicopter',
  boat: 'boat',
  bicycle: 'bicycle',
  'bike-rack': 'bike-rack',
  'roof-cargo': 'roof-cargo',
  kayak: 'kayak',
  trolley: 'trolley',
  'tow-truck': 'tow-truck',
  'delivery-van': 'delivery-van',
  'garbage-truck': 'garbage-truck',
  taxi: 'taxi',
  'moving-truck': 'moving-truck',
  'cement-truck': 'cement-truck',
  camper: 'camper',
  'mail-truck': 'mail-truck',
  'electric-car': 'electric-car',
  minivan: 'minivan',
  'stop-sign': 'stop-sign',
  'yield-sign': 'yield-sign',
  'speed-limit-55': 'speed-limit-55',
  'deer-crossing': 'deer-crossing',
  'traffic-light': 'traffic-light',
  'welcome-sign': 'welcome-sign',
  'railroad-crossing': 'railroad-crossing',
  'construction-cones': 'construction-cones',
  'detour-sign': 'detour-sign',
  'exit-sign': 'exit-sign',
  'mile-marker': 'mile-marker',
  'state-line': 'state-line',
  'cattle-crossing': 'cattle-crossing',
  'falling-rocks': 'falling-rocks',
  'one-lane-bridge': 'one-lane-bridge',
  'no-passing': 'no-passing',
  'rest-area': 'rest-area',
  'picnic-area': 'picnic-area',
  'double-yellow': 'double-yellow',
  'merge-sign': 'merge-sign',
  'curve-ahead': 'curve-ahead',
  'airport-sign': 'airport-sign',
  overpass: 'overpass',
  'slow-sign': 'slow-sign',
  'school-zone': 'school-zone',
  'pedestrian-crossing': 'pedestrian-crossing',
  roundabout: 'roundabout',
  'construction-zone': 'construction-zone',
  'out-of-state-plate': 'out-of-state-plate',
  'road-work-ahead': 'road-work-ahead',
  cow: 'cow',
  horse: 'horse',
  deer: 'deer',
  dog: 'dog',
  bird: 'bird',
  squirrel: 'squirrel',
  chicken: 'chicken',
  rabbit: 'rabbit',
  cat: 'cat',
  turkey: 'turkey',
  duck: 'duck',
  sheep: 'sheep',
};

const SIGN_IDS = new Set([
  'stop-sign', 'yield-sign', 'speed-limit-55', 'deer-crossing', 'traffic-light',
  'welcome-sign', 'railroad-crossing', 'construction-cones', 'detour-sign', 'exit-sign',
  'mile-marker', 'state-line', 'cattle-crossing', 'falling-rocks', 'one-lane-bridge',
  'no-passing', 'rest-area', 'picnic-area', 'double-yellow', 'merge-sign',
  'curve-ahead', 'airport-sign', 'overpass', 'slow-sign', 'school-zone',
  'pedestrian-crossing', 'roundabout', 'construction-zone', 'out-of-state-plate', 'road-work-ahead',
]);

const ANIMAL_IDS = new Set([
  'cow', 'horse', 'deer', 'dog', 'bird', 'squirrel',
  'chicken', 'rabbit', 'cat', 'turkey', 'duck', 'sheep',
]);

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
  return sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function resolveId(filename) {
  const base = basename(filename, '.png').toLowerCase();
  // bingo-vehicle-<slug> or <timestamp>_bingo-<slug>
  let slug = base
    .replace(/^bingo-vehicle-/, '')
    .replace(/^bingo-sign-/, '')
    .replace(/^bingo-animal-/, '')
    .replace(/^\d{4}-\d{2}-\d{2}_\d{4}_bingo-/, '')
    .replace(/^bingo-/, '');
  return SLUG_TO_ID[slug] ?? null;
}

async function promoteFile(srcPath, itemId) {
  const raw = await sharp(srcPath).png().toBuffer();
  const cleared = await floodClear(raw);
  const outPath = join(OUT, `${itemId}.png`);
  await sharp(cleared).toFile(outPath);
  const draftDir = ANIMAL_IDS.has(itemId)
    ? DRAFTS_ANIMALS
    : SIGN_IDS.has(itemId)
      ? DRAFTS_SIGNS
      : DRAFTS_VEHICLES;
  await mkdir(draftDir, { recursive: true });
  await sharp(srcPath).toFile(join(draftDir, `${itemId}.png`));
  console.log('promoted', itemId, '←', basename(srcPath));
  return outPath;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(DRAFTS_VEHICLES, { recursive: true });
  await mkdir(DRAFTS_SIGNS, { recursive: true });
  await mkdir(DRAFTS_ANIMALS, { recursive: true });
  await mkdir(REPLICATE, { recursive: true });

  const args = process.argv.slice(2);
  const onlySigns = args.includes('--signs');
  const onlyVehicles = args.includes('--vehicles');
  const onlyAnimals = args.includes('--animals');
  const fileArgs = args.filter((a) => !a.startsWith('--'));
  const sources = [];

  if (fileArgs.length) {
    for (const a of fileArgs) sources.push(a);
  } else if (existsSync(CURSOR_ASSETS)) {
    for (const name of await readdir(CURSOR_ASSETS)) {
      const isVehicle = /^bingo-vehicle-.*\.png$/i.test(name);
      const isSign = /^bingo-sign-.*\.png$/i.test(name);
      const isAnimal = /^bingo-animal-.*\.png$/i.test(name);
      if (onlySigns && !isSign) continue;
      if (onlyVehicles && !isVehicle) continue;
      if (onlyAnimals && !isAnimal) continue;
      const anyFilter = onlySigns || onlyVehicles || onlyAnimals;
      if (!anyFilter && !isVehicle && !isSign && !isAnimal) continue;
      if (isVehicle || isSign || isAnimal) {
        sources.push(join(CURSOR_ASSETS, name));
      }
    }
  }

  if (!sources.length) {
    console.error('No sources found');
    process.exit(1);
  }

  const done = [];
  for (const src of sources) {
    const id = resolveId(src);
    if (!id) {
      console.warn('skip unknown', basename(src));
      continue;
    }
    await promoteFile(src, id);
    done.push(id);
  }
  console.log(JSON.stringify({ promoted: done }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
