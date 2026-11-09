import { AppState } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { usePreferencesStore } from '../store/preferencesStore';
import { usePurchaseStore } from '../store/purchaseStore';
import { useSessionStore } from '../store/sessionStore';
import { THEME_IDS, type ThemeId } from '../types/theme';
import { isThemeId } from '../types/theme';
import { resolveSelectableTheme } from '../utils/themeEntitlement';
import { canAttemptOpenJingle, shouldRetrySilentPlayback } from './audioSessionPolicy';

const PLAYER_OPTS = { keepAudioSessionActive: true } as const;

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

type SharedPlayerId = 'tap' | 'invalid' | 'round-start' | 'open-jingle';
type ThemedKind = 'claim' | 'win' | 'horn-car' | 'horn-truck';

const players: Partial<Record<string, AudioPlayer>> = {};
const stallRetryByPlayer = new WeakMap<AudioPlayer, number>();
let audioModeApplied = false;
let playersReady = false;
let openJinglePlayedThisSession = false;

function warnSfx(message: string, error?: unknown): void {
  if (__DEV__) {
    console.warn(`[sfx] ${message}`, error ?? '');
  }
}

function resolvedThemeId(): ThemeId {
  const sessionTheme = useSessionStore.getState().session?.themeId;
  const selected = usePreferencesStore.getState().preferences.selectedThemeId;
  const ownedThemeIds = usePurchaseStore.getState().ownedThemeIds;
  if (isThemeId(sessionTheme)) {
    return sessionTheme;
  }
  return resolveSelectableTheme(selected, ownedThemeIds);
}

function themedPlayerId(kind: ThemedKind, theme: ThemeId): string {
  return `${kind}:${theme}`;
}

function prefs() {
  return usePreferencesStore.getState().preferences;
}

export function invalidateAudioMode(): void {
  audioModeApplied = false;
}

export async function applyAudioMode(force = false): Promise<void> {
  if (audioModeApplied && !force) {
    return;
  }
  await setAudioModeAsync({
    playsInSilentMode: true,
    allowsRecording: false,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  });
  audioModeApplied = true;
}

function createPlayer(source: number): AudioPlayer {
  return createAudioPlayer(source, PLAYER_OPTS);
}

export async function preloadSounds(): Promise<void> {
  await applyAudioMode();
  if (playersReady) {
    return;
  }
  players.tap = createPlayer(require('../../assets/sounds/tap.wav'));
  players.invalid = createPlayer(require('../../assets/sounds/invalid.wav'));
  players['round-start'] = createPlayer(require('../../assets/sounds/round-start.wav'));
  players['open-jingle'] = createPlayer(require('../../assets/sounds/open-jingle.wav'));
  for (const theme of THEME_IDS) {
    players[themedPlayerId('claim', theme)] = createPlayer(CLAIM_SOUNDS[theme]);
    players[themedPlayerId('win', theme)] = createPlayer(WIN_SOUNDS[theme]);
    players[themedPlayerId('horn-car', theme)] = createPlayer(HORN_CAR_SOUNDS[theme]);
    players[themedPlayerId('horn-truck', theme)] = createPlayer(HORN_TRUCK_SOUNDS[theme]);
  }
  playersReady = true;
}

function playerById(id: SharedPlayerId | string): AudioPlayer | undefined {
  return players[id];
}

function themedPlayer(kind: ThemedKind): AudioPlayer | undefined {
  return playerById(themedPlayerId(kind, resolvedThemeId()));
}

async function playPlayer(player: AudioPlayer | null | undefined): Promise<void> {
  if (!player) {
    return;
  }
  try {
    if (player.playing || player.currentTime > 0) {
      await player.seekTo(0);
    }
  } catch (error) {
    warnSfx('seekTo failed', error);
  }
  player.play();
  const token = (stallRetryByPlayer.get(player) ?? 0) + 1;
  stallRetryByPlayer.set(player, token);
  setTimeout(() => {
    if (stallRetryByPlayer.get(player) !== token) {
      return;
    }
    if (
      shouldRetrySilentPlayback({
        playing: player.playing,
        currentTime: player.currentTime,
        duration: player.duration,
      })
    ) {
      warnSfx(`stalled player ${player.id}; retrying play()`);
      try {
        player.play();
      } catch (error) {
        warnSfx('retry play failed', error);
      }
    }
  }, 220);
}

async function withAudio(run: () => Promise<void>): Promise<void> {
  await applyAudioMode();
  await preloadSounds();
  await run();
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
    await withAudio(async () => {
      await playPlayer(playerById('tap'));
    });
  } catch (error) {
    warnSfx('tap failed', error);
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
    await withAudio(async () => {
      await playPlayer(themedPlayer('claim') ?? playerById('tap'));
    });
  } catch (error) {
    warnSfx('claim failed', error);
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
    await withAudio(async () => {
      await playPlayer(playerById('invalid'));
    });
  } catch (error) {
    warnSfx('invalid failed', error);
  }
}

export async function playRoundStartFeedback(): Promise<void> {
  const { soundEffectsEnabled } = prefs();
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await withAudio(async () => {
      await playPlayer(playerById('round-start'));
    });
  } catch (error) {
    warnSfx('round-start failed', error);
  }
}

export async function playWinFeedback(): Promise<void> {
  const { soundEffectsEnabled } = prefs();
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await withAudio(async () => {
      await playPlayer(themedPlayer('win'));
    });
  } catch (error) {
    warnSfx('win failed', error);
  }
}

/** Light car horn — used at round end with the win sting (not stacked on the truck). */
export async function playHornFeedback(): Promise<void> {
  const { hapticsEnabled, soundEffectsEnabled } = prefs();
  if (hapticsEnabled) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await withAudio(async () => {
      await playPlayer(themedPlayer('horn-car'));
    });
  } catch (error) {
    warnSfx('horn-car failed', error);
  }
}

/** Semi-truck horn for in-round climaxes (bingo line, first plate, color-catch win cell). */
export async function playTruckHornFeedback(): Promise<void> {
  const { hapticsEnabled, soundEffectsEnabled } = prefs();
  if (hapticsEnabled) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
  if (!soundEffectsEnabled) {
    return;
  }
  try {
    await withAudio(async () => {
      await playPlayer(themedPlayer('horn-truck'));
    });
  } catch (error) {
    warnSfx('horn-truck failed', error);
  }
}

/** Settings diagnostic: always plays, even if Sound effects is off. */
export async function playSoundCheckFeedback(): Promise<void> {
  try {
    await withAudio(async () => {
      await playPlayer(themedPlayer('claim') ?? playerById('tap'));
    });
  } catch (error) {
    warnSfx('sound check failed', error);
  }
}

/** Cold-start opening sting. Call from Home and again when returning to foreground until it succeeds. */
export async function playOpenJingle(): Promise<void> {
  if (
    !canAttemptOpenJingle({
      alreadyPlayed: openJinglePlayedThisSession,
      introEnabled: prefs().introJingleEnabled,
      appState: AppState.currentState,
    })
  ) {
    return;
  }
  try {
    await withAudio(async () => {
      await playPlayer(playerById('open-jingle'));
    });
    openJinglePlayedThisSession = true;
  } catch (error) {
    warnSfx('open jingle failed', error);
  }
}

export function onAppBecameActive(): void {
  invalidateAudioMode();
  void applyAudioMode(true).catch((error) => warnSfx('restore audio mode failed', error));
  void playOpenJingle();
}

export function resetOpenJingleSessionFlagForTests(): void {
  openJinglePlayedThisSession = false;
}

export function resetAudioForTests(): void {
  audioModeApplied = false;
  playersReady = false;
  openJinglePlayedThisSession = false;
  for (const key of Object.keys(players)) {
    delete players[key];
  }
}
