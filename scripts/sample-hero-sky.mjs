/**
 * Average the top ~2% of a hero/scenery image. That hex is the letterbox +
 * stack-header bleed that must be stored next to the asset.
 *
 *   node scripts/sample-hero-sky.mjs path/to/hero.webp
 */
import sharp from 'sharp';

export async function sampleTopSky(file) {
  const img = sharp(file);
  const { width, height } = await img.metadata();
  if (!width || !height) {
    throw new Error(`Could not read dimensions: ${file}`);
  }
  const band = Math.max(12, Math.round(height * 0.02));
  const { data } = await img
    .extract({ left: 0, top: 0, width, height: band })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) {
      continue;
    }
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n += 1;
  }
  if (!n) {
    throw new Error(`No opaque pixels in top band: ${file}`);
  }
  const hex = (value) => Math.round(value / n).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

const isCli = process.argv[1]?.replaceAll('\\', '/').endsWith('sample-hero-sky.mjs');
if (isCli) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node scripts/sample-hero-sky.mjs path/to/hero.webp');
    process.exit(1);
  }
  const sky = await sampleTopSky(input);
  console.log(sky);
}
