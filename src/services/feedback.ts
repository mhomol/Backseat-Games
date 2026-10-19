import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { usePreferencesStore } from '../store/preferencesStore';
import { usePurchaseStore } from '../store/purchaseStore';
import { useSessionStore } from '../store/sessionStore';
import type { ThemeId } from '../types/theme';
import { isThemeId } from '../types/theme';
import { resolveSelectableTheme } from '../utils/themeEntitlement';

const CLAIM_SOUNDS = {
  classic: require('../../assets/sounds/claim.wav'),
  halloween: require('../../assets/sounds/halloween/claim.wav'),
  thanksgiving: require('../../assets/sounds/thanksgiving/claim.wav'),
  christmas: require('../../assets/sounds/christmas/claim.wav'),
} as const;

const WIN_SOUNDS = {
  classic: require('../../assets/sounds/win.wav'),
  halloween: require('../../assets/sounds/halloween/win.wav'),
  thanksgiving: require('../../assets/sounds/thanksgiving/win.wav'),
  christmas: require('../../assets/sounds/christmas/win.wav'),
} as const;

const HORN_CAR_SOUNDS = {
  classic: require('../../assets/sounds/horn-car.wav'),
  halloween: require('../../assets/sounds/halloween/horn-car.wav'),
  thanksgiving: require('../../assets/sounds/thanksgiving/horn-car.wav'),
  christmas: require('../../assets/sounds/christmas/horn-car.wav'),
} as const;

const HORN_TRUCK_SOUNDS = {
  classic: require('../../assets/sounds/horn-truck.wav'),
  halloween: require('../../assets/sounds/halloween/horn-truck.wav'),
  thanksgiving: require('../../assets/sounds/thanksgiving/horn-truck.wav'),
  christmas: require('../../assets/sounds/christmas/horn-truck.wav'),
} as const;

let tapPlayer: AudioPlayer | null = null;
let winPlayer: AudioPlayer | null = null;
let hornCarPlayer: AudioPlayer | null = null;
let hornTruckPlayer: AudioPlayer | null = null;
let claimPlayer: AudioPlayer | null = null;
let invalidPlayer: AudioPlayer | null = null;
let roundStartPlayer: AudioPlayer | null = null;
let openJinglePlayer: AudioPlayer | null = null;
let sharedReady = false;
let loadedTheme: ThemeId | null = null;
let openJinglePlayedThisSession = false;

function resolvedThemeId(): ThemeId {
  const sessionTheme = useSessionStore.getState().session?.themeId;
  const selected = usePreferencesStore.getState().preferences.selectedThemeId;
  const ownedThemeIds = usePurchaseStore.getState().ownedThemeIds;
  if (isThemeId(sessionTheme)) {
    return sessionTheme;
  }
  return resolveSelectableTheme(selected, ownedThemeIds);
}

function replacePlayer(current: AudioPlayer | null, source: number): AudioPlayer {
  current?.remove();
  return createAudioPlayer(source);
}

async function ensureAudio(): Promise<void> {
  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
  if (!sharedReady) {
    tapPlayer = createAudioPlayer(require('../../assets/sounds/tap.wav'));
    invalidPlayer = createAudioPlayer(require('../../assets/sounds/invalid.wav'));
    roundStartPlayer = createAudioPlayer(require('../../assets/sounds/round-start.wav'));
    openJinglePlayer = createAudioPlayer(require('../../assets/sounds/open-jingle.wav'));
    sharedReady = true;
  }
  const theme = resolvedThemeId();
  if (loadedTheme === theme && claimPlayer && winPlayer && hornCarPlayer && hornTruckPlayer) {
    return;
  }
  claimPlayer = replacePlayer(claimPlayer, CLAIM_SOUNDS[theme]);
  winPlayer = replacePlayer(winPlayer, WIN_SOUNDS[theme]);
  hornCarPlayer = replacePlayer(hornCarPlayer, HORN_CAR_SOUNDS[theme]);
  hornTruckPlayer = replacePlayer(hornTruckPlayer, HORN_TRUCK_SOUNDS[theme]);
  loadedTheme = theme;
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
