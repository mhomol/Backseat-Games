/** Pure helpers for iOS SFX playback. Kept free of React Native so unit tests can run in Node. */

export function canAttemptOpenJingle(input: {
  alreadyPlayed: boolean;
  introEnabled: boolean;
  appState: string;
}): boolean {
  return !input.alreadyPlayed && input.introEnabled && input.appState === 'active';
}

/** True when play() likely never started, so one retry is worth it. */
export function shouldRetrySilentPlayback(input: {
  playing: boolean;
  currentTime: number;
  duration: number;
}): boolean {
  if (input.playing) {
    return false;
  }
  if (input.currentTime > 0.05) {
    return false;
  }
  if (input.duration > 0 && input.currentTime >= input.duration - 0.03) {
    return false;
  }
  return true;
}
