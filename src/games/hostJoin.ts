import type { Player, SessionState } from '../types/game';
import { addPlayer } from './ruleEngine';

export type HostJoinResolution =
  | { kind: 'rewelcome'; playerId: string }
  | { kind: 'new'; player: Player; nextSession: SessionState };

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
  const joiner = createPlayer(joinerId, joinerName);
  return {
    kind: 'new',
    player: joiner,
    nextSession: addPlayer(session, joiner),
  };
}
