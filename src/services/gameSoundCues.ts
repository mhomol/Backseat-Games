import type { SessionState } from '../types/game';

/** Stable key for one round-start sting; null when no cue should play. */
export function roundStartSoundKey(session: SessionState | null | undefined): string | null {
  if (!session || session.phase !== 'playing' || !session.sessionId) {
    return null;
  }
  if (session.gameState?.type === 'hangman') {
    return `${session.sessionId}:hangman:${session.gameState.round}`;
  }
  return `${session.sessionId}:playing`;
}

let lastPlayedRoundStartKey: string | null = null;

/** Returns true once per key. Clears when the session leaves `playing` so a replayed session can sting again. */
export function consumeRoundStartOpportunity(key: string | null): boolean {
  if (!key) {
    lastPlayedRoundStartKey = null;
    return false;
  }
  if (key === lastPlayedRoundStartKey) {
    return false;
  }
  lastPlayedRoundStartKey = key;
  return true;
}

export function resetRoundStartCueForTests(): void {
  lastPlayedRoundStartKey = null;
}
