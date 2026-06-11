import { plates } from '../data';
import type {
  ApplyResult,
  GameAction,
  LicensePlatesState,
  SessionState,
} from '../types/game';

export function createLicensePlatesState(): LicensePlatesState {
  const claims: Record<string, string | null> = {};
  for (const plate of plates) {
    claims[plate.code] = null;
  }
  return { type: 'license-plates', claims };
}

export function applyLicensePlatesAction(
  session: SessionState,
  playerId: string,
  action: GameAction,
): ApplyResult {
  if (session.gameState?.type !== 'license-plates') {
    return { ok: false, reason: 'Wrong game type.' };
  }

  const state = session.gameState;

  if (action.type === 'CLAIM_PLATE') {
    const owner = state.claims[action.plateCode];
    if (owner === undefined) {
      return { ok: false, reason: 'Unknown plate.' };
    }
    if (owner === playerId) {
      return { ok: false, reason: 'You already claimed this plate.' };
    }
    if (owner !== null) {
      const other = session.players.find((p) => p.id === owner);
      return {
        ok: false,
        reason: `Already claimed by ${other?.name ?? 'someone else'}.`,
      };
    }
    return {
      ok: true,
      state: {
        ...session,
        lastRejection: null,
        gameState: {
          ...state,
          claims: { ...state.claims, [action.plateCode]: playerId },
        },
      },
    };
  }

  if (action.type === 'UNCLAIM_PLATE') {
    if (!session.gameRules['license-plates'].allowUnclaim) {
      return { ok: false, reason: 'Unclaiming plates is turned off for this game.' };
    }
    const owner = state.claims[action.plateCode];
    if (owner !== playerId) {
      return { ok: false, reason: 'You can only unclaim plates you hold.' };
    }
    return {
      ok: true,
      state: {
        ...session,
        lastRejection: null,
        gameState: {
          ...state,
          claims: { ...state.claims, [action.plateCode]: null },
        },
      },
    };
  }

  return { ok: false, reason: 'Invalid action for License Plates.' };
}

export function getLicensePlateScores(
  state: LicensePlatesState,
  players: SessionState['players'],
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const player of players) {
    scores[player.id] = 0;
  }
  for (const owner of Object.values(state.claims)) {
    if (owner) {
      scores[owner] = (scores[owner] ?? 0) + 1;
    }
  }
  return scores;
}

export function resolveLicensePlateWinner(session: SessionState): string | null {
  if (session.gameState?.type !== 'license-plates') {
    return null;
  }
  const scores = getLicensePlateScores(session.gameState, session.players);
  let maxScore = -1;
  let leaderId: string | null = null;
  let tied = false;

  for (const player of session.players) {
    const score = scores[player.id] ?? 0;
    if (score > maxScore) {
      maxScore = score;
      leaderId = player.id;
      tied = false;
    } else if (score === maxScore && score >= 0) {
      tied = true;
    }
  }

  if (maxScore <= 0 || tied) {
    return null;
  }
  return leaderId;
}
