/**
 * Generate Backseat Games brand imagery via Recraft V4 (locked style bible).
 * Requires REPLICATE_API_TOKEN.
 *
 * Usage:
 *   node scripts/generate-brand-assets.mjs
 *   node scripts/generate-brand-assets.mjs host join logo icon
 *   node scripts/generate-brand-assets.mjs --promote home
 */

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROMPTS_PATH = join(__dirname, 'brand-prompts.json');
const DRAFTS = join(ROOT, 'assets/branding/drafts');
const BRANDING = join(ROOT, 'assets/branding');
const MARKETING = join(ROOT, 'assets/branding/marketing');

function buildPrompt(template, { styleBlock, logoBlock }) {
  return template
    .replaceAll('{{styleBlock}}', styleBlock)
    .replaceAll('{{logoBlock}}', logoBlock);
}

async function generateOne(key, config, token) {
  const scene = config.scenes[key];
  if (!scene) {
    throw new Error(`Unknown scene key: ${key}`);
  }

  const prompt = buildPrompt(scene.prompt, config);
  const res = await fetch(
    `https://api.replicate.com/v1/models/${config.model}/predictions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: scene.aspect_ratio,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${key}: ${res.status} ${err}`);
  }

  const data = await res.json();
  if (data.status !== 'succeeded' || !data.output) {
    throw new Error(`${key} failed: ${data.error ?? data.status}`);
  }

  const url = Array.isArray(data.output) ? data.output[0] : data.output;
  const imgRes = await fetch(url);
  const ext = url.includes('.webp') ? 'webp' : 'png';
  const outPath = join(DRAFTS, `${key}-draft-recraft-v4.${ext}`);
  await writeFile(outPath, Buffer.from(await imgRes.arrayBuffer()));
  console.log(`Wrote ${outPath}`);
  return outPath;
}

async function promote(key) {
  const webp = join(DRAFTS, `${key}-draft-recraft-v4.webp`);
  const png = join(DRAFTS, `${key}-draft-recraft-v4.png`);
  let src = webp;
  try {
    await readFile(webp);
  } catch {
    src = png;
  }

  const targets = {
    home: { path: join(BRANDING, 'home-hero.webp'), marketing: 'home-hero.webp' },
    host: { path: join(BRANDING, 'host-hero.webp'), marketing: 'host-hero.webp' },
    join: { path: join(BRANDING, 'join-hero.webp'), marketing: 'join-hero.webp' },
    logo: { path: join(BRANDING, 'logo-lockup.webp'), marketing: 'logo-lockup.webp' },
    icon: { path: join(ROOT, 'assets/icon.png'), marketing: 'app-icon-candidate.webp' },
  };

  const target = targets[key];
  if (!target) {
    throw new Error(`Cannot promote unknown key: ${key}`);
  }

  await mkdir(BRANDING, { recursive: true });
  await mkdir(MARKETING, { recursive: true });
  await copyFile(src, target.path);
  await copyFile(src, join(MARKETING, target.marketing));
  console.log(`Promoted ${key} -> ${target.path}`);

  if (key === 'icon') {
    try {
      const sharp = (await import('sharp')).default;
      await sharp(src).resize(1024, 1024).png().toFile(join(ROOT, 'assets/icon.png'));
      await sharp(src).resize(1024, 1024).png().toFile(join(ROOT, 'assets/splash-icon.png'));
      console.log('Converted icon to assets/icon.png + splash-icon.png');
    } catch (e) {
      console.warn('sharp not available; icon left as webp copy only');
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const promoteOnly = args.includes('--promote');
  const promoteKeys = args.filter((a) => a !== '--promote');

  if (promoteOnly) {
    const keys = promoteKeys.length ? promoteKeys : ['home', 'host', 'join', 'logo', 'icon'];
    for (const key of keys) {
      await promote(key);
    }
    return;
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.error('Set REPLICATE_API_TOKEN to generate brand assets.');
    process.exit(1);
  }

  const config = JSON.parse(await readFile(PROMPTS_PATH, 'utf8'));
  await mkdir(DRAFTS, { recursive: true });

  const keys = promoteKeys.length ? promoteKeys : Object.keys(config.scenes);
  for (const key of keys) {
    console.log(`Generating ${key} (recraft-v4)...`);
    await generateOne(key, config, token);
  }

  console.log('\nReview assets/branding/drafts/, then promote:');
  console.log('  node scripts/generate-brand-assets.mjs --promote home host join logo icon');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
