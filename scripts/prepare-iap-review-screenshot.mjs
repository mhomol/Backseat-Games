/**
 * Compose IAP assets for App Store Connect.
 *
 * - Promotional Image: 1024×1024 (Image field)
 * - App Review Screenshot: iPhone portrait App Store size (Review Information field)
 *
 * Usage:
 *   node scripts/prepare-iap-review-screenshot.mjs [input.png]
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SKY = '#5CB9E0';

/** Promotional image — Image field on IAP page. */
const PROMO_SIZE = 1024;

/** App Review Screenshot — must match App Store screenshot specs (6.7" iPhone portrait). */
const REVIEW_WIDTH = 1290;
const REVIEW_HEIGHT = 2796;

const input =
  process.argv[2] ??
  path.join(root, 'assets/branding/marketing/iap-host-unlock-source.png');

const promoOutput = path.join(
  root,
  'assets/branding/marketing/iap-host-unlock-promo-1024.png',
);
const reviewOutput = path.join(
  root,
  'assets/branding/marketing/iap-host-unlock-review-1290x2796.png',
);

async function composePromo1024(source) {
  const scaled = await sharp(source)
    .resize({ height: PROMO_SIZE, fit: 'inside' })
    .png()
    .toBuffer();

  const { width, height } = await sharp(scaled).metadata();
  const left = Math.round((PROMO_SIZE - width) / 2);
  const top = Math.round((PROMO_SIZE - height) / 2);

  await sharp({
    create: {
      width: PROMO_SIZE,
      height: PROMO_SIZE,
      channels: 4,
      background: SKY,
    },
  })
    .composite([{ input: scaled, left, top }])
    .png()
    .toFile(promoOutput);

  console.log(`Promo (Image field): ${promoOutput} — ${PROMO_SIZE}×${PROMO_SIZE}`);
}

async function composeReviewScreenshot(source) {
  // Exact App Store 6.7" portrait dimensions — aspect ratio matches source (~0.46).
  await sharp(source)
    .resize(REVIEW_WIDTH, REVIEW_HEIGHT, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(reviewOutput);

  const meta = await sharp(reviewOutput).metadata();
  console.log(
    `Review (App Review Screenshot): ${reviewOutput} — ${meta.width}×${meta.height}`,
  );
}

await composePromo1024(input);
await composeReviewScreenshot(input);

console.log('\nUpload in App Store Connect:');
console.log('  Image → iap-host-unlock-promo-1024.png (1024×1024)');
console.log('  App Review Screenshot → iap-host-unlock-review-1290x2796.png (1290×2796)');
