/**
 * Run bria/expand-image with explicit vertical canvas (no aspect_ratio).
 * Usage: node scripts/run-bria-expand.mjs
 */

import { createReadStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INPUT = join(ROOT, 'assets/branding/drafts/home-hero-draft-recraft-v4.webp');
const OUT = join(ROOT, 'assets/branding/drafts/home-hero-bria-expanded.webp');

const token = process.env.REPLICATE_API_TOKEN;
if (!token) {
  console.error('REPLICATE_API_TOKEN is not set');
  process.exit(1);
}

async function uploadFile(path) {
  const form = new FormData();
  const buf = await readFile(path);
  form.append('content', new Blob([buf], { type: 'image/webp' }), 'home-hero.webp');

  const res = await fetch('https://api.replicate.com/v1/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.urls?.get ?? data.url;
}

async function runExpand(imageUrl) {
  const input = {
    image: imageUrl,
    canvas_size: [768, 1664],
    original_image_size: [768, 1344],
    original_image_location: [0, 160],
    prompt:
      'Extend blue sky and white clouds above, gray coastal road with yellow dashed center line below. Same vibrant cartoon road trip illustration style.',
    negative_prompt:
      'new signs, new car, new text, logo changes, people, animals, buildings, horizontal expansion, wider canvas, photorealistic, watermark',
    seed: 42,
    preserve_alpha: false,
    sync: true,
  };

  console.log('Input:', JSON.stringify(input, null, 2));

  const res = await fetch(
    'https://api.replicate.com/v1/models/bria/expand-image/predictions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({ input }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Prediction failed: ${res.status} ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  console.log('Uploading source image...');
  const imageUrl = await uploadFile(INPUT);
  console.log('Uploaded:', imageUrl);

  console.log('Running bria/expand-image...');
  const prediction = await runExpand(imageUrl);
  console.log('Status:', prediction.status);

  if (prediction.status !== 'succeeded') {
    console.error('Error:', prediction.error ?? prediction);
    process.exit(1);
  }

  const outputUrl = prediction.output;
  console.log('Output URL:', outputUrl);

  const imgRes = await fetch(outputUrl);
  await writeFile(OUT, Buffer.from(await imgRes.arrayBuffer()));
  console.log('Saved:', OUT);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
