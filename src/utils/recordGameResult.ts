import { clonePlayerStats } from '../data/defaultStats';
import type { SessionState } from '../types/game';
import type { PlayerStats } from '../types/stats';

export type RecordGameResult = {
  stats: PlayerStats;
  recorded: boolean;
};

/**
 * Increment local W/L/T when a session first reaches finished.
 * Achievements can hook the same finished-session signal later.
 */
export function recordGameResult(
  stats: PlayerStats,
  previousSession: SessionState | null,
  nextSession: SessionState,
  localPlayerId: string,
): RecordGameResult {
  if (nextSession.phase !== 'finished') {
    return { stats, recorded: false };
  }

  if (previousSession?.phase === 'finished' && previousSession.sessionId === nextSession.sessionId) {
    return { stats, recorded: false };
  }

  if (stats.lastRecordedSessionId === nextSession.sessionId) {
    return { stats, recorded: false };
  }

  if (!nextSession.gameType) {
    return { stats, recorded: false };
  }

  const gameType = nextSession.gameType;
  const outcome = { ...stats.byGame[gameType] };

  if (nextSession.winnerId === localPlayerId) {
    outcome.wins += 1;
  } else if (nextSession.winnerId) {
    outcome.losses += 1;
  } else {
    outcome.ties += 1;
  }

  const nextStats = clonePlayerStats({
    byGame: {
      ...stats.byGame,
      [gameType]: outcome,
    },
    lastRecordedSessionId: nextSession.sessionId,
  });

  return { stats: nextStats, recorded: true };
}
