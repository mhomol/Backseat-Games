/**
 * Short themed SFX for claim / win / horn-car / horn-truck.
 * Cartoon synth, not licensed samples. Run: npm run generate:theme-sounds
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RATE = 22050;

function writeWav(path, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels(), 22);
  buffer.writeUInt32LE(RATE, 24);
  buffer.writeUInt32LE(RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  }
  return writeFile(path, buffer);
}

function numChannels() {
  return 1;
}

function alloc(sec) {
  return new Float32Array(Math.floor(RATE * sec));
}

function mixInto(target, source, atSec, gain = 1) {
  const start = Math.floor(atSec * RATE);
  for (let i = 0; i < source.length && start + i < target.length; i += 1) {
    target[start + i] += source[i] * gain;
  }
}

function env(i, n, attack = 0.01, release = 0.2) {
  const t = i / RATE;
  const dur = n / RATE;
  const a = Math.min(1, t / attack);
  const r = t > dur - release ? Math.max(0, (dur - t) / release) : 1;
  return a * r;
}

function noiseBurst(sec, volume, decay) {
  const out = alloc(sec);
  for (let i = 0; i < out.length; i += 1) {
    const t = i / RATE;
    out[i] = (Math.random() * 2 - 1) * volume * Math.exp(-t * decay);
  }
  return out;
}

function sineSweep(startHz, endHz, sec, volume, decay) {
  const out = alloc(sec);
  let phase = 0;
  for (let i = 0; i < out.length; i += 1) {
    const u = i / (out.length - 1);
    const hz = startHz + (endHz - startHz) * u;
    phase += (2 * Math.PI * hz) / RATE;
    const t = i / RATE;
    out[i] = Math.sin(phase) * volume * Math.exp(-t * decay) * env(i, out.length, 0.008, 0.05);
  }
  return out;
}

function fmBell(hz, sec, volume) {
  const out = alloc(sec);
  for (let i = 0; i < out.length; i += 1) {
    const t = i / RATE;
    const mod = Math.sin(2 * Math.PI * hz * 3.5 * t) * 12 * Math.exp(-t * 8);
    out[i] =
      Math.sin(2 * Math.PI * hz * t + mod) * volume * Math.exp(-t * 5) +
      Math.sin(2 * Math.PI * hz * 2.7 * t) * volume * 0.25 * Math.exp(-t * 9);
  }
  return out;
}

function glassClink() {
  const out = alloc(0.28);
  mixInto(out, noiseBurst(0.04, 0.35, 80), 0, 1);
  mixInto(out, sineSweep(2100, 1800, 0.22, 0.22, 8), 0, 1);
  mixInto(out, sineSweep(3150, 2800, 0.18, 0.12, 12), 0.01, 1);
  return out;
}

function twinkleChime() {
  const out = alloc(0.38);
  mixInto(out, fmBell(1046.5, 0.32, 0.17), 0, 1);
  mixInto(out, fmBell(1568, 0.26, 0.12), 0.05, 1);
  mixInto(out, fmBell(2093, 0.22, 0.08), 0.1, 1);
  return out;
}

function boo() {
  const out = alloc(0.42);
  mixInto(out, sineSweep(220, 140, 0.38, 0.28, 3.5), 0, 1);
  mixInto(out, sineSweep(440, 180, 0.32, 0.1, 5), 0.02, 1);
  mixInto(out, noiseBurst(0.2, 0.08, 14), 0.02, 1);
  return out;
}

function evilLaugh() {
  const out = alloc(1.05);
  const hops = [0, 0.16, 0.3, 0.5, 0.64, 0.82];
  hops.forEach((at, i) => {
    const hz = i % 2 === 0 ? 280 : 360;
    mixInto(out, sineSweep(hz, hz * 0.72, 0.14, 0.22, 10), at, 1);
    mixInto(out, noiseBurst(0.08, 0.06, 30), at, 1);
  });
  return out;
}

function ghostWail() {
  const out = alloc(0.7);
  mixInto(out, sineSweep(520, 380, 0.65, 0.18, 1.4), 0, 1);
  mixInto(out, sineSweep(780, 420, 0.55, 0.08, 2), 0.05, 1);
  return out;
}

function cartoonShriek() {
  const out = alloc(0.55);
  mixInto(out, sineSweep(700, 1800, 0.22, 0.16, 1), 0, 1);
  mixInto(out, sineSweep(1800, 900, 0.28, 0.14, 4), 0.2, 1);
  mixInto(out, noiseBurst(0.12, 0.08, 20), 0.18, 1);
  return out;
}

function gobble() {
  const out = alloc(0.7);
  for (let g = 0; g < 6; g += 1) {
    const wobble = alloc(0.1);
    for (let i = 0; i < wobble.length; i += 1) {
      const t = i / RATE;
      const trem = 1 + 0.65 * Math.sin(2 * Math.PI * 28 * t);
      wobble[i] = Math.sin(2 * Math.PI * (210 + g * 8) * t) * 0.22 * trem * env(i, wobble.length, 0.005, 0.03);
    }
    mixInto(out, wobble, g * 0.09, 1);
  }
  return out;
}

function windGust() {
  const out = alloc(0.65);
  for (let i = 0; i < out.length; i += 1) {
    const t = i / RATE;
    const swirl = 0.5 + 0.5 * Math.sin(2 * Math.PI * 6 * t);
    out[i] = (Math.random() * 2 - 1) * 0.18 * swirl * env(i, out.length, 0.05, 0.2);
  }
  return out;
}

function cheers() {
  const out = alloc(0.95);
  mixInto(out, noiseBurst(0.9, 0.12, 2.2), 0, 1);
  for (let c = 0; c < 8; c += 1) {
    mixInto(out, noiseBurst(0.05, 0.2, 40), 0.05 + c * 0.08, 1);
    mixInto(out, sineSweep(400 + c * 40, 360, 0.12, 0.05, 18), 0.06 + c * 0.08, 1);
  }
  return out;
}

function hoHoHo() {
  const out = alloc(0.95);
  [0, 0.28, 0.56].forEach((at, i) => {
    const start = 180 - i * 12;
    mixInto(out, sineSweep(start, start * 0.7, 0.22, 0.26, 7), at, 1);
    mixInto(out, noiseBurst(0.08, 0.05, 22), at + 0.02, 1);
  });
  return out;
}

function sleighBells() {
  const out = alloc(0.55);
  for (let i = 0; i < 7; i += 1) {
    mixInto(out, fmBell(1400 + (i % 3) * 180, 0.18, 0.12), i * 0.06, 1);
    mixInto(out, noiseBurst(0.03, 0.1, 50), i * 0.06, 1);
  }
  return out;
}

function jingleBellsHook() {
  const melody = [659.25, 659.25, 659.25, 659.25, 659.25, 659.25, 659.25, 783.99, 523.25, 587.33, 659.25];
  const gaps = [0, 0.16, 0.32, 0.56, 0.72, 0.88, 1.12, 1.28, 1.46, 1.62, 1.8];
  const out = alloc(2.15);
  melody.forEach((hz, i) => mixInto(out, fmBell(hz, 0.32, 0.14), gaps[i], 1));
  return out;
}

const JOBS = [
  ['halloween', 'claim', boo],
  ['halloween', 'win', evilLaugh],
  ['halloween', 'horn-car', ghostWail],
  ['halloween', 'horn-truck', cartoonShriek],
  ['thanksgiving', 'claim', glassClink],
  ['thanksgiving', 'win', gobble],
  ['thanksgiving', 'horn-car', windGust],
  ['thanksgiving', 'horn-truck', cheers],
  ['christmas', 'claim', twinkleChime],
  ['christmas', 'win', hoHoHo],
  ['christmas', 'horn-car', sleighBells],
  ['christmas', 'horn-truck', jingleBellsHook],
];

const sounds = join(ROOT, 'assets/sounds');
for (const [theme, name, make] of JOBS) {
  const dir = join(sounds, theme);
  await mkdir(dir, { recursive: true });
  const dest = join(dir, `${name}.wav`);
  await writeWav(dest, make());
  console.log(dest);
}
