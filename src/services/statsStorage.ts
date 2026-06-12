import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clonePlayerGameStats,
  clonePlayerStats,
  DEFAULT_PLAYER_GAME_STATS,
  DEFAULT_PLAYER_STATS,
} from '../data/defaultStats';
import type { GameType } from '../types/game';
import type { PlayerStats } from '../types/stats';

const STORAGE_KEY = 'backseat-games.player-stats';

const GAME_TYPES: GameType[] = ['license-plates', 'sign-game', 'bingo'];

function mergeWithDefaults(partial: Partial<PlayerStats> | null): PlayerStats {
  if (!partial) {
    return clonePlayerStats(DEFAULT_PLAYER_STATS);
  }

  const byGame = clonePlayerGameStats(DEFAULT_PLAYER_GAME_STATS);
  for (const gameType of GAME_TYPES) {
    const saved = partial.byGame?.[gameType];
    if (saved) {
      byGame[gameType] = {
        wins: saved.wins ?? 0,
        losses: saved.losses ?? 0,
        ties: saved.ties ?? 0,
      };
    }
  }

  return {
    byGame,
    lastRecordedSessionId: partial.lastRecordedSessionId ?? null,
  };
}

export async function loadStats(): Promise<PlayerStats> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return clonePlayerStats(DEFAULT_PLAYER_STATS);
    }
    return mergeWithDefaults(JSON.parse(raw) as Partial<PlayerStats>);
  } catch {
    return clonePlayerStats(DEFAULT_PLAYER_STATS);
  }
}

export async function saveStats(stats: PlayerStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Non-fatal — app falls back to in-memory defaults.
  }
}
