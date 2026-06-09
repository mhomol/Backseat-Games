import type { Player } from '../types/game';

export function playerFromLocal(id: string, name: string, isHost: boolean): Player {
  return { id, name, isHost, connected: true };
}
