import Constants from 'expo-constants';
import type { MultiplayerService } from './types';
import { createMockMultiplayerService } from './MockMultiplayerService';
import { createRelayMultiplayerService, RelayMultiplayerService } from './RelayMultiplayerService';

let singleton: MultiplayerService | null = null;

export function getMultiplayerSingleton(): MultiplayerService {
  if (!singleton) {
    const isExpoGo = Constants.appOwnership === 'expo';
    singleton = isExpoGo ? createMockMultiplayerService() : createRelayMultiplayerService();
  }
  return singleton;
}

export function resetMultiplayerService(): void {
  singleton?.dispose();
  singleton = null;
}

export type { RelayMultiplayerService };
