/**
 * Resize a new hero PNG/WebP into game-scenery rotation size and print the registry snippet.
 *
 * Usage:
 *   node scripts/promote-game-scenery.mjs path/to/hero.png "Desert canyon"
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'assets/branding/game-scenery');
const W = 720;
const H = 1456;

const input = process.argv[2];
const label = process.argv[3];

if (!input || !label) {
  console.error('Usage: node scripts/promote-game-scenery.mjs <input.png> "Label"');
  process.exit(1);
}

const base = path.basename(input, path.extname(input))
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const id = base.endsWith('-blue-sky') ? base : `${base}-blue-sky`;
const outFile = `${id}.webp`;
const outPath = path.join(outDir, outFile);

await mkdir(outDir, { recursive: true });
await sharp(input)
  .resize(W, H, { fit: 'cover', position: 'bottom' })
  .webp({ quality: 92 })
  .toFile(outPath);

console.log(`Wrote assets/branding/game-scenery/${outFile} (${W}×${H})`);
console.log('\nAdd to src/data/gameSceneryRotation.ts:');
console.log(`  {
    id: '${id}',
    label: '${label}',
    source: require('../../assets/branding/game-scenery/${outFile}'),
  },`);
console.log('\nUpdate assets/branding/game-scenery/ROTATION.md with the new row.');
