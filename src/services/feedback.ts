import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { usePreferencesStore } from '../store/preferencesStore';

let tapPlayer: AudioPlayer | null = null;
let winPlayer: AudioPlayer | null = null;
let audioReady = false;

async function ensureAudio(): Promise<void> {
  if (audioReady) {
    return;
  }
  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
  tapPlayer = createAudioPlayer(require('../../assets/sounds/tap.wav'));
  winPlayer = createAudioPlayer(require('../../assets/sounds/win.wav'));
  audioReady = true;
}

function prefs() {
  return usePreferencesStore.getState().preferences;
}

export async function playTapFeedback(): Promise<void> {
  const { hapticsEnabled, soundEffectsEnabled } = prefs();
  if (hapticsEnabled) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await ensureAudio();
    tapPlayer?.seekTo(0);
    tapPlayer?.play();
  } catch {
    // Audio is optional polish.
  }
}

export async function playWinFeedback(): Promise<void> {
  const { soundEffectsEnabled } = prefs();
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await ensureAudio();
    winPlayer?.seekTo(0);
    winPlayer?.play();
  } catch {
    // Audio is optional polish.
  }
}
