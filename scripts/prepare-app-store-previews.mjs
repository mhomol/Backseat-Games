/**
 * Prepare iPhone screen recordings for App Store Connect App Previews.
 *
 * App Preview dimensions differ from screenshot dimensions:
 *   iPhone 6.3" / 6.5" / 6.9" preview slot → 886 × 1920 portrait
 *
 * Re-encodes to H.264 (iOS screen recordings are often HEVC), 30 fps CFR,
 * stereo AAC audio, 15–30 second duration.
 *
 * Usage:
 *   npm run prepare:app-store-previews
 *   node scripts/prepare-app-store-previews.mjs [inputDir] [outputDir]
 *
 * Default input:  assets/marketing/app-store-previews/raw/
 * Default output: assets/marketing/app-store-previews/output/
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'url';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const DEFAULT_INPUT = path.join(root, 'assets/marketing/app-store-previews/raw');
const DEFAULT_OUTPUT = path.join(root, 'assets/marketing/app-store-previews/output');

const MIN_DURATION_SEC = 15;
const MAX_DURATION_SEC = 30;

/** Apple App Preview resolution for modern iPhone display classes (portrait). */
const PREVIEW_WIDTH = 886;
const PREVIEW_HEIGHT = 1920;

const VIDEO_EXT = new Set(['.mov', '.mp4', '.m4v']);

function slugBase(name) {
  return path
    .basename(name, path.extname(name))
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function runCommand(bin, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr.trim() || `Command failed (${code}): ${bin}`));
      }
    });
  });
}

async function probeVideo(filePath) {
  const { stdout } = await runCommand(ffprobeStatic.path, [
    '-v',
    'error',
    '-show_entries',
    'format=duration:stream=codec_type,codec_name',
    '-of',
    'json',
    filePath,
  ]);

  const parsed = JSON.parse(stdout);
  const duration = Number.parseFloat(parsed.format?.duration ?? '0');
  const streams = parsed.streams ?? [];
  const hasAudio = streams.some((stream) => stream.codec_type === 'audio');
  const videoCodec = streams.find((stream) => stream.codec_type === 'video')?.codec_name ?? 'unknown';

  return { duration, hasAudio, videoCodec };
}

async function listVideos(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      await fs.mkdir(dir, { recursive: true });
      return [];
    }
    throw error;
  }

  return entries
    .filter((entry) => entry.isFile() && VIDEO_EXT.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

function buildScaleFilter(width, height) {
  return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1`;
}

async function encodePreview(sourcePath, destPath, { hasAudio, outputDuration }) {
  const scale = buildScaleFilter(PREVIEW_WIDTH, PREVIEW_HEIGHT);
  const args = ['-y', '-i', sourcePath];

  if (!hasAudio) {
    args.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000');
  }

  args.push('-t', String(outputDuration), '-vf', scale);

  if (!hasAudio) {
    args.push('-map', '0:v:0', '-map', '1:a:0', '-shortest');
  }

  args.push(
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-level',
    '4.0',
    '-pix_fmt',
    'yuv420p',
    '-b:v',
    '11M',
    '-maxrate',
    '12M',
    '-bufsize',
    '24M',
    '-r',
    '30',
    '-vsync',
    'cfr',
    '-c:a',
    'aac',
    '-b:a',
    '256k',
    '-ac',
    '2',
    '-ar',
    '48000',
    '-movflags',
    '+faststart',
    destPath,
  );

  if (!ffmpegStatic) {
    throw new Error('ffmpeg binary not found (ffmpeg-static). Run npm install.');
  }

  await runCommand(ffmpegStatic, args);
}

async function main() {
  if (!ffmpegStatic || !ffprobeStatic?.path) {
    console.error('ffmpeg/ffprobe binaries missing. Run: npm install');
    process.exit(1);
  }

  const inputDir = path.resolve(process.argv[2] ?? DEFAULT_INPUT);
  const outputDir = path.resolve(process.argv[3] ?? DEFAULT_OUTPUT);
  const outSlot = path.join(outputDir, 'iphone-preview');

  const files = await listVideos(inputDir);
  if (files.length === 0) {
    console.log(`No videos found in:\n  ${inputDir}`);
    console.log('\nDrop iPhone screen recordings (.mov or .mp4) there, then run:');
    console.log('  npm run prepare:app-store-previews');
    process.exit(1);
  }

  await fs.mkdir(outSlot, { recursive: true });

  console.log(`Input:  ${inputDir} (${files.length} video${files.length === 1 ? '' : 's'})`);
  console.log(`Output: ${outSlot}`);
  console.log(`Target: ${PREVIEW_WIDTH}×${PREVIEW_HEIGHT} H.264, 30 fps, 15–30s\n`);

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const sourcePath = path.join(inputDir, file);
    const order = String(index + 1).padStart(2, '0');
    const base = slugBase(file) || `preview-${order}`;
    const destName = `${order}-${base}.mp4`;
    const destPath = path.join(outSlot, destName);

    const { duration, hasAudio, videoCodec } = await probeVideo(sourcePath);
    const rounded = Math.round(duration * 10) / 10;

    if (duration < MIN_DURATION_SEC) {
      console.warn(
        `  ⚠ ${file} is ${rounded}s — Apple requires at least ${MIN_DURATION_SEC}s. Upload may be rejected.`,
      );
    } else if (duration > MAX_DURATION_SEC) {
      console.log(`  ℹ ${file} is ${rounded}s — trimming to ${MAX_DURATION_SEC}s.`);
    }

    const outputDuration = Math.min(Math.max(duration, 0.1), MAX_DURATION_SEC);

    console.log(`  → ${destName}`);
    console.log(`    source: ${rounded}s, ${videoCodec}${hasAudio ? ', with audio' : ', adding silent stereo audio'}`);

    await encodePreview(sourcePath, destPath, { hasAudio, outputDuration });
  }

  console.log('\nDone.\n');
  console.log('Upload in App Store Connect → Media Manager → App Previews:');
  console.log(`  • iPhone 6.3" (or 6.5" / 6.9") slot — ${PREVIEW_WIDTH}×${PREVIEW_HEIGHT}`);
  console.log('  • Up to 3 previews, 15–30 seconds each');
  console.log('\nNote: App Preview video size (886×1920) is smaller than screenshot size (1206×2622).');
}

await main();
