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

function appendSegment(target, segment, gapSec = 0, sampleRate = 22050) {
  const gap = gapSec > 0 ? Math.floor(sampleRate * gapSec) : 0;
  const next = new Float32Array(target.length + gap + segment.length);
  next.set(target, 0);
  next.set(segment, target.length + gap);
  return next;
}

function hornTone(freq, durationSec, sampleRate, volume = 0.28, decay = 6) {
  const count = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const t = i / sampleRate;
    const attack = Math.min(1, t * 40);
    const release = Math.exp(-t * decay);
    const wave =
      Math.sin(2 * Math.PI * freq * t) * 0.7 +
      Math.sin(2 * Math.PI * freq * 1.01 * t) * 0.3;
    samples[i] = wave * volume * attack * release;
  }
  return samples;
}

function carHorn(sampleRate = 22050) {
  const high = hornTone(523, 0.11, sampleRate, 0.24, 14);
  const low = hornTone(440, 0.13, sampleRate, 0.24, 12);
  return appendSegment(high, low, 0.06, sampleRate);
}

function truckHorn(sampleRate = 22050) {
  const fundamental = hornTone(196, 0.55, sampleRate, 0.3, 2.2);
  const harmonics = hornTone(294, 0.55, sampleRate, 0.12, 2.4);
  const count = fundamental.length;
  const samples = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    samples[i] = fundamental[i] + harmonics[i];
  }
  return samples;
}

await mkdir(OUT_DIR, { recursive: true });
await writeWav(join(OUT_DIR, 'tap.wav'), tone(880, 0.06, 22050, 0.2));
await writeWav(join(OUT_DIR, 'win.wav'), chord([523.25, 659.25, 783.99], 0.35, 22050));
await writeWav(join(OUT_DIR, 'horn-car.wav'), carHorn());
await writeWav(join(OUT_DIR, 'horn-truck.wav'), truckHorn());
console.log('Wrote assets/sounds/tap.wav, win.wav, horn-car.wav, horn-truck.wav');
