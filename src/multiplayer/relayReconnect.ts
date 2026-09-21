export type RelayStatus = 'connected' | 'reconnecting' | 'disconnected';

export type RelayReconnectDeps = {
  hosting: boolean;
  joinCode: string | null;
  displayName: string;
  registerInRoom: () => Promise<void>;
  routeJoinMessage: (joinCode: string, displayName: string) => Promise<void>;
  onStatus: ((status: RelayStatus) => void) | null;
  onHostGone?: () => void;
};

export function beginRelayReconnect(onStatus: RelayReconnectDeps['onStatus']): void {
  onStatus?.('reconnecting');
}

export function isHostGoneHubError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /Host is not connected yet/i.test(message);
}

/** Re-register after SignalR automatic reconnect. Guests also re-send JOIN. */
export async function resumeRelayAfterReconnect(deps: RelayReconnectDeps): Promise<void> {
  await deps.registerInRoom();
  if (!deps.hosting && deps.joinCode) {
    try {
      await deps.routeJoinMessage(deps.joinCode, deps.displayName);
    } catch (error) {
      if (isHostGoneHubError(error)) {
        deps.onHostGone?.();
      } else {
        throw error;
      }
    }
  }
  deps.onStatus?.('connected');
}
