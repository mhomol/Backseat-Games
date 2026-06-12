import { create } from 'zustand';
import { clonePlayerStats, DEFAULT_PLAYER_STATS } from '../data/defaultStats';
import { loadStats, saveStats } from '../services/statsStorage';
import type { SessionState } from '../types/game';
import type { PlayerStats } from '../types/stats';
import { recordGameResult } from '../utils/recordGameResult';

interface StatsStore {
  stats: PlayerStats;
  loaded: boolean;
  loadStats: () => Promise<void>;
  recordFinishedSession: (
    previousSession: SessionState | null,
    nextSession: SessionState,
    localPlayerId: string,
  ) => void;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  stats: clonePlayerStats(DEFAULT_PLAYER_STATS),
  loaded: false,

  loadStats: async () => {
    const stats = await loadStats();
    set({ stats, loaded: true });
  },

  recordFinishedSession: (previousSession, nextSession, localPlayerId) => {
    const result = recordGameResult(get().stats, previousSession, nextSession, localPlayerId);
    if (!result.recorded) {
      return;
    }
    set({ stats: result.stats });
    void saveStats(result.stats);
  },
}));
