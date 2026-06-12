import type { GameType } from './game';

export type GameOutcome = {
  wins: number;
  losses: number;
  ties: number;
};

export type PlayerGameStats = Record<GameType, GameOutcome>;

export type PlayerStats = {
  byGame: PlayerGameStats;
  lastRecordedSessionId: string | null;
};
