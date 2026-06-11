/**
 * Build Flux Fill Pro inputs: alpha PNG (transparent strips) + optional B&W mask.
 *
 * Usage:
 *   node scripts/prepare-hero-flux-input.mjs
 *   node scripts/prepare-hero-flux-input.mjs assets/branding/drafts/home-hero-draft-recraft-v4.webp
 *   node scripts/prepare-hero-flux-input.mjs input.webp --top 160 --bottom 160
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_INPUT = join(ROOT, 'assets/branding/drafts/home-hero-draft-recraft-v4.webp');
const DRAFTS = join(ROOT, 'assets/branding/drafts');

function parseArgs(argv) {
  const args = { input: DEFAULT_INPUT, top: 160, bottom: 160 };
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--top') {
      args.top = Number(argv[++i]);
    } else if (arg === '--bottom') {
      args.bottom = Number(argv[++i]);
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  if (positional[0]) {
    args.input = join(process.cwd(), positional[0]);
  }

  return args;
}

async function main() {
  const { input, top, bottom } = parseArgs(process.argv.slice(2));
  const sharp = (await import('sharp')).default;

  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read dimensions from ${input}`);
  }

  const srcW = meta.width;
  const srcH = meta.height;
  const outW = srcW;
  const outH = srcH + top + bottom;

  const stem = input.replace(/\\/g, '/').split('/').pop().replace(/\.[^.]+$/, '');
  const alphaOut = join(DRAFTS, `${stem}-flux-input.png`);
  const maskOut = join(DRAFTS, `${stem}-flux-mask.png`);

  await sharp({
    create: {
      width: outW,
      height: outH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input, top, left: 0 }])
    .png()
    .toFile(alphaOut);

  await sharp({
    create: {
      width: outW,
      height: outH,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: srcW,
            height: srcH,
            channels: 3,
            background: { r: 0, g: 0, b: 0 },
          },
        })
          .png()
          .toBuffer(),
        top,
        left: 0,
      },
    ])
    .png()
    .toFile(maskOut);

  console.log(`Source:     ${input} (${srcW}×${srcH})`);
  console.log(`Canvas:     ${outW}×${outH} (+${top}px top, +${bottom}px bottom)`);
  console.log(`Alpha PNG:  ${alphaOut}`);
  console.log(`Mask PNG:   ${maskOut}`);
  console.log('');
  console.log('Upload the alpha PNG to Flux Fill Pro as the image input.');
  console.log('If the UI requires a mask too, use the mask PNG (white = fill, black = keep).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
