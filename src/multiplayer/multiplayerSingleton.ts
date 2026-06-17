import { createHybridMultiplayerService, HybridMultiplayerService } from './HybridMultiplayerService';

let singleton: HybridMultiplayerService | null = null;

export function getHybridMultiplayerService(): HybridMultiplayerService {
  if (!singleton) {
    singleton = createHybridMultiplayerService();
  }
  return singleton;
}

export function resetMultiplayerService(): void {
  singleton?.dispose();
  singleton = null;
}
