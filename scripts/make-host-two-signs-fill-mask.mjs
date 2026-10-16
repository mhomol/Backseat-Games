import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRAFTS = join(ROOT, 'assets/branding/drafts');
const HERO = join(ROOT, 'assets/branding/host-hero.webp');

const W = 720;
const H = 1456;
const x = 4;
const y = 1150;
const w = 300;
const h = 178;

const maskSvg = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#000"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#fff"/>
  </svg>`,
);

const overlay = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="rgba(255,48,96,0.45)"/>
  </svg>`,
);

const maskPath = join(DRAFTS, 'host-hero-two-signs-fill-mask.png');
const previewPath = join(DRAFTS, 'host-hero-two-signs-fill-preview.png');
const cropPath = join(DRAFTS, 'host-hero-two-signs-fill-preview-crop.png');

await sharp(maskSvg).png().blur(5).toFile(maskPath);
await sharp(HERO).composite([{ input: overlay, blend: 'over' }]).png().toFile(previewPath);
await sharp(previewPath).extract({ left: 0, top: 1000, width: 480, height: 400 }).png().toFile(cropPath);
console.log(maskPath);
console.log(previewPath);
