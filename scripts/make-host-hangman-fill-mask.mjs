import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRAFTS = join(ROOT, 'assets/branding/drafts');
const HERO = join(ROOT, 'assets/branding/host-hero.webp');

const W = 720;
const H = 1456;

async function main() {
  await mkdir(DRAFTS, { recursive: true });

  const maskSvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="#000"/>
      <rect x="4" y="1152" width="300" height="142" rx="14" fill="#fff"/>
    </svg>`,
  );

  const maskPath = join(DRAFTS, 'host-hero-hangman-fill-mask.png');
  const sourcePath = join(DRAFTS, 'host-hero-flux-fill.png');
  const previewPath = join(DRAFTS, 'host-hero-hangman-fill-preview.png');

  await sharp(maskSvg).png().blur(5).toFile(maskPath);
  await sharp(HERO).png().toFile(sourcePath);

  const previewOverlay = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="1152" width="300" height="142" rx="14" fill="rgba(255,48,96,0.45)"/>
    </svg>`,
  );

  await sharp(HERO).composite([{ input: previewOverlay, blend: 'over' }]).png().toFile(previewPath);

  const twoY = 1150;
  const twoH = 178;
  const twoW = 300;
  const twoX = 4;

  const twoMaskSvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="#000"/>
      <rect x="${twoX}" y="${twoY}" width="${twoW}" height="${twoH}" rx="14" fill="#fff"/>
    </svg>`,
  );

  const twoMaskPath = join(DRAFTS, 'host-hero-two-signs-fill-mask.png');
  const twoPreviewPath = join(DRAFTS, 'host-hero-two-signs-fill-preview.png');

  await sharp(twoMaskSvg).png().blur(5).toFile(twoMaskPath);

  const twoPreview = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${twoX}" y="${twoY}" width="${twoW}" height="${twoH}" rx="14" fill="rgba(255,48,96,0.45)"/>
    </svg>`,
  );

  await sharp(HERO).composite([{ input: twoPreview, blend: 'over' }]).png().toFile(twoPreviewPath);

  console.log(`Source PNG: ${sourcePath}`);
  console.log(`Mask PNG:   ${maskPath}`);
  console.log(`Preview:    ${previewPath}`);
  console.log(`Two-sign mask:    ${twoMaskPath}`);
  console.log(`Two-sign preview: ${twoPreviewPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
