/**
 * Resize iPhone screenshots for App Store Connect.
 *
 * - Strips alpha (flattens on white) — fixes "Images can't contain alpha channels"
 * - Exports JPEG (opaque) at ASC-approved dimensions
 *
 * Usage:
 *   npm run prepare:app-store-screenshots
 *   node scripts/resize-app-store-screenshots.mjs [inputDir] [outputDir]
 *
 * Default input:  assets/marketing/app-store-screenshots/raw/
 * Default output: assets/marketing/app-store-screenshots/output/
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const DEFAULT_INPUT = path.join(root, 'assets/marketing/app-store-screenshots/raw');
const DEFAULT_OUTPUT = path.join(root, 'assets/marketing/app-store-screenshots/output');

const BACKGROUND = '#ffffff';

/** App Store Connect iPhone screenshot sizes (portrait). */
const SIZES = [
  {
    id: '6.3-inch',
    label: 'iPhone 6.3" — iPhone 17 native',
    width: 1206,
    height: 2622,
  },
  {
    id: '6.5-inch',
    label: 'iPhone 6.5" — required submission tier',
    width: 1284,
    height: 2778,
  },
  {
    id: '6.9-inch',
    label: 'iPhone 6.9" — 2026 primary showcase tier',
    width: 1320,
    height: 2868,
  },
];

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif']);

function slugBase(name) {
  return path
    .basename(name, path.extname(name))
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

async function listImages(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      await fs.mkdir(dir, { recursive: true });
      return [];
    }
    throw error;
  }

  return entries
    .filter((entry) => entry.isFile() && IMAGE_EXT.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

async function exportScreenshot(sourcePath, destPath, width, height) {
  await sharp(sourcePath)
    .rotate()
    .flatten({ background: BACKGROUND })
    .resize(width, height, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(destPath);

  const meta = await sharp(destPath).metadata();
  if (meta.width !== width || meta.height !== height) {
    throw new Error(`Unexpected output size ${meta.width}×${meta.height} for ${destPath}`);
  }
  if (meta.hasAlpha) {
    throw new Error(`Output still has alpha: ${destPath}`);
  }
}

async function main() {
  const inputDir = path.resolve(process.argv[2] ?? DEFAULT_INPUT);
  const outputDir = path.resolve(process.argv[3] ?? DEFAULT_OUTPUT);

  const files = await listImages(inputDir);
  if (files.length === 0) {
    console.log(`No images found in:\n  ${inputDir}`);
    console.log('\nDrop iPhone screenshots (.png or .jpg) there, then run:');
    console.log('  npm run prepare:app-store-screenshots');
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });
  for (const size of SIZES) {
    await fs.mkdir(path.join(outputDir, size.id), { recursive: true });
  }

  console.log(`Input:  ${inputDir} (${files.length} image${files.length === 1 ? '' : 's'})`);
  console.log(`Output: ${outputDir}\n`);

  let wrote = 0;
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const sourcePath = path.join(inputDir, file);
    const order = String(index + 1).padStart(2, '0');
    const base = slugBase(file) || `screenshot-${order}`;

    for (const size of SIZES) {
      const destName = `${order}-${base}.jpg`;
      const destPath = path.join(outputDir, size.id, destName);
      await exportScreenshot(sourcePath, destPath, size.width, size.height);
      console.log(`  ${size.id}/${destName}  (${size.width}×${size.height})`);
      wrote += 1;
    }
    console.log('');
  }

  console.log(`Done — ${wrote} files in ${SIZES.length} size folders.\n`);
  console.log('Upload in App Store Connect → Media Manager:');
  console.log('  • 6.5-inch or 6.9-inch — required for submission (pick one set)');
  console.log('  • 6.3-inch — optional, matches iPhone 17 native captures');
}

await main();
