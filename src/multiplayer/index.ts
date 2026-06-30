import { getMultiplayerSingleton, resetMultiplayerService } from './multiplayerSingleton';

export type { MultiplayerService } from './types';
export { resetMultiplayerService };

export function getMultiplayerService() {
  return getMultiplayerSingleton();
}
