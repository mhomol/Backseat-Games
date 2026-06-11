import { cloneGameRules, DEFAULT_GAME_RULES } from '../data/defaultPreferences';
import type { Player, SessionState } from '../types/game';
import type { GameRules } from '../types/preferences';
import { createSession } from './ruleEngine';

export function playerFromLocal(id: string, name: string, isHost: boolean): Player {
  return { id, name, isHost, connected: true };
}

export function testSession(
  sessionId: string,
  host: Player,
  gameType: NonNullable<SessionState['gameType']>,
  gameRules: GameRules = DEFAULT_GAME_RULES,
): SessionState {
  return createSession(sessionId, host, gameType, cloneGameRules(gameRules));
}
