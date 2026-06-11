/**
 * Generates short UI wav files for tap and win feedback.
 * Run: node scripts/generate-sounds.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'assets', 'sounds');

function writeWav(path, samples, sampleRate = 22050) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  return writeFile(path, buffer);
}

function tone(freq, durationSec, sampleRate, volume = 0.25) {
  const count = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 10);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * volume * envelope;
  }
  return samples;
}

function chord(freqs, durationSec, sampleRate, volume = 0.18) {
  const count = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 4);
    let value = 0;
    for (const freq of freqs) {
      value += Math.sin(2 * Math.PI * freq * t);
    }
    samples[i] = (value / freqs.length) * volume * envelope;
  }
  return samples;
}

await mkdir(OUT_DIR, { recursive: true });
await writeWav(join(OUT_DIR, 'tap.wav'), tone(880, 0.06, 22050, 0.2));
await writeWav(join(OUT_DIR, 'win.wav'), chord([523.25, 659.25, 783.99], 0.35, 22050));
console.log('Wrote assets/sounds/tap.wav and win.wav');
