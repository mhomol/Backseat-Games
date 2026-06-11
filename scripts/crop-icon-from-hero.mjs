/**
 * Crop a car + landscape square from home-hero for the app icon.
 * Run: npm run crop:icon
 */
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, 'assets', 'branding', 'home-hero.webp');
const DRAFT = join(ROOT, 'assets', 'branding', 'drafts', 'icon-car-crop.webp');
const ICON = join(ROOT, 'assets', 'icon.png');
const SPLASH = join(ROOT, 'assets', 'splash-icon.png');

/** Below logo block; square frame on car, road, mountains, and ocean. */
const CROP = { left: 0, top: 360, width: 768, height: 768 };

async function main() {
  const sharp = (await import('sharp')).default;
  await mkdir(dirname(DRAFT), { recursive: true });

  const pipeline = sharp(SOURCE).extract(CROP).resize(1024, 1024, { fit: 'cover' });

  await pipeline.clone().webp({ quality: 92 }).toFile(DRAFT);
  await pipeline.clone().png().toFile(ICON);
  await pipeline.png().toFile(SPLASH);

  console.log(`Cropped ${CROP.width}x${CROP.height} from y=${CROP.top}`);
  console.log(`Draft: ${DRAFT}`);
  console.log(`Icon:  ${ICON}`);
  console.log(`Splash: ${SPLASH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
