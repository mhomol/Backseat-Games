import type { LicensePlatesState, SessionState } from '../types/game';

export function collectNewlySpottedPlates(
  previous: SessionState | null,
  next: SessionState,
  localPlayerId: string,
): string[] {
  if (next.gameState?.type !== 'license-plates') {
    return [];
  }
  const nextClaims = next.gameState.claims;
  const previousClaims: LicensePlatesState['claims'] =
    previous?.gameState?.type === 'license-plates' && previous.sessionId === next.sessionId
      ? previous.gameState.claims
      : {};

  const spotted: string[] = [];
  for (const [code, owner] of Object.entries(nextClaims)) {
    if (owner === localPlayerId && previousClaims[code] !== localPlayerId) {
      spotted.push(code);
    }
  }
  return spotted;
}
