import type { Player, SessionState } from '../types/game';
import { HANGMAN_MAX_PLAYERS } from './hangman';
import { addPlayer } from './ruleEngine';

export type HostJoinResolution =
  | { kind: 'rewelcome'; playerId: string }
  | { kind: 'new'; player: Player; nextSession: SessionState }
  | { kind: 'rejected'; reason: string };

export function resolveIncomingJoin(
  session: SessionState,
  joinerName: string,
  joinerId: string,
  createPlayer: (id: string, name: string) => Player,
): HostJoinResolution {
  const normalized = joinerName.trim().toLowerCase();
  const existingPlayer = session.players.find(
    (player) => !player.isHost && player.name.trim().toLowerCase() === normalized,
  );
  if (existingPlayer) {
    return { kind: 'rewelcome', playerId: existingPlayer.id };
  }
  if (session.gameType === 'hangman' && session.players.length >= HANGMAN_MAX_PLAYERS) {
    return {
      kind: 'rejected',
      reason: 'Hangman is two players only — this game is already full.',
    };
  }
  const joiner = createPlayer(joinerId, joinerName);
  return {
    kind: 'new',
    player: joiner,
    nextSession: addPlayer(session, joiner),
  };
}
