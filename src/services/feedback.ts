import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { usePreferencesStore } from '../store/preferencesStore';

let tapPlayer: AudioPlayer | null = null;
let winPlayer: AudioPlayer | null = null;
let hornCarPlayer: AudioPlayer | null = null;
let hornTruckPlayer: AudioPlayer | null = null;
let claimPlayer: AudioPlayer | null = null;
let bingoPlayer: AudioPlayer | null = null;
let invalidPlayer: AudioPlayer | null = null;
let roundStartPlayer: AudioPlayer | null = null;
let openJinglePlayer: AudioPlayer | null = null;
let audioReady = false;
let openJinglePlayedThisSession = false;

async function ensureAudio(): Promise<void> {
  if (audioReady) {
    return;
  }
  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
  tapPlayer = createAudioPlayer(require('../../assets/sounds/tap.wav'));
  winPlayer = createAudioPlayer(require('../../assets/sounds/win.wav'));
  hornCarPlayer = createAudioPlayer(require('../../assets/sounds/horn-car.wav'));
  hornTruckPlayer = createAudioPlayer(require('../../assets/sounds/horn-truck.wav'));
  claimPlayer = createAudioPlayer(require('../../assets/sounds/claim.wav'));
  bingoPlayer = createAudioPlayer(require('../../assets/sounds/bingo.wav'));
  invalidPlayer = createAudioPlayer(require('../../assets/sounds/invalid.wav'));
  roundStartPlayer = createAudioPlayer(require('../../assets/sounds/round-start.wav'));
  openJinglePlayer = createAudioPlayer(require('../../assets/sounds/open-jingle.wav'));
  audioReady = true;
}

function prefs() {
  return usePreferencesStore.getState().preferences;
}

async function playPlayer(player: AudioPlayer | null | undefined): Promise<void> {
  player?.seekTo(0);
  player?.play();
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
    await playPlayer(tapPlayer);
  } catch {
    // Audio is optional polish.
  }
}

export async function playClaimFeedback(): Promise<void> {
  const { hapticsEnabled, soundEffectsEnabled } = prefs();
  if (hapticsEnabled) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await ensureAudio();
    await playPlayer(claimPlayer ?? tapPlayer);
  } catch {
    // Audio is optional polish.
  }
}

export async function playBingoFeedback(): Promise<void> {
  const { hapticsEnabled, soundEffectsEnabled } = prefs();
  if (hapticsEnabled) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await ensureAudio();
    await playPlayer(bingoPlayer);
  } catch {
    // Audio is optional polish.
  }
}

export async function playInvalidFeedback(): Promise<void> {
  const { hapticsEnabled, soundEffectsEnabled } = prefs();
  if (hapticsEnabled) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await ensureAudio();
    await playPlayer(invalidPlayer);
  } catch {
    // Audio is optional polish.
  }
}

export async function playRoundStartFeedback(): Promise<void> {
  const { soundEffectsEnabled } = prefs();
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await ensureAudio();
    await playPlayer(roundStartPlayer);
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
    await playPlayer(winPlayer);
  } catch {
    // Audio is optional polish.
  }
}

/** Light car horn for routine plate/bingo marks. */
export async function playHornFeedback(): Promise<void> {
  const { hapticsEnabled, soundEffectsEnabled } = prefs();
  if (hapticsEnabled) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await ensureAudio();
    await playPlayer(hornCarPlayer);
  } catch {
    // Audio is optional polish.
  }
}

/** Semi-truck horn for big moments (bingo, wins, first claim). */
export async function playTruckHornFeedback(): Promise<void> {
  const { hapticsEnabled, soundEffectsEnabled } = prefs();
  if (hapticsEnabled) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await ensureAudio();
    await playPlayer(hornTruckPlayer);
  } catch {
    // Audio is optional polish.
  }
}

/** Cold-start opening sting. Call once per app session from Home. */
export async function playOpenJingle(): Promise<void> {
  if (openJinglePlayedThisSession) {
    return;
  }
  const { introJingleEnabled } = prefs();
  if (!introJingleEnabled) {
    return;
  }
  openJinglePlayedThisSession = true;
  try {
    await ensureAudio();
    await playPlayer(openJinglePlayer);
  } catch {
    // Audio is optional polish.
  }
}

export function resetOpenJingleSessionFlagForTests(): void {
  openJinglePlayedThisSession = false;
}
