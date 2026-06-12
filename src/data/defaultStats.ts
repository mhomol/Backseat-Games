import type { GameOutcome, PlayerGameStats, PlayerStats } from '../types/stats';

export const ZERO_OUTCOME: GameOutcome = { wins: 0, losses: 0, ties: 0 };

export const DEFAULT_PLAYER_GAME_STATS: PlayerGameStats = {
  'license-plates': { ...ZERO_OUTCOME },
  'sign-game': { ...ZERO_OUTCOME },
  bingo: { ...ZERO_OUTCOME },
};

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  byGame: DEFAULT_PLAYER_GAME_STATS,
  lastRecordedSessionId: null,
};

export function cloneGameOutcome(outcome: GameOutcome): GameOutcome {
  return { ...outcome };
}

export function clonePlayerGameStats(stats: PlayerGameStats): PlayerGameStats {
  return {
    'license-plates': cloneGameOutcome(stats['license-plates']),
    'sign-game': cloneGameOutcome(stats['sign-game']),
    bingo: cloneGameOutcome(stats.bingo),
  };
}

export function clonePlayerStats(stats: PlayerStats): PlayerStats {
  return {
    byGame: clonePlayerGameStats(stats.byGame),
    lastRecordedSessionId: stats.lastRecordedSessionId,
  };
}
