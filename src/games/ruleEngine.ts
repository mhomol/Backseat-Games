import type {
  ApplyResult,
  GameAction,
  GameType,
  Player,
  SessionState,
} from '../types/game';
import { createBingoState, applyBingoAction } from './bingo';
import {
  applyLicensePlatesAction,
  createLicensePlatesState,
} from './licensePlates';
import { applySignGameAction, createSignGameState } from './signGame';

export function createSession(
  sessionId: string,
  host: Player,
  gameType: GameType,
): SessionState {
  return {
    sessionId,
    phase: 'lobby',
    gameType,
    players: [host],
    hostId: host.id,
    gameState: null,
    winnerId: null,
    lastRejection: null,
  };
}

export function startGame(session: SessionState): SessionState {
  if (!session.gameType) {
    return session;
  }

  let gameState = null;
  switch (session.gameType) {
    case 'license-plates':
      gameState = createLicensePlatesState();
      break;
    case 'bingo':
      gameState = createBingoState(session);
      break;
    case 'sign-game':
      gameState = createSignGameState(session.players);
      break;
    default:
      break;
  }

  return {
    ...session,
    phase: 'playing',
    gameState,
    winnerId: null,
    lastRejection: null,
  };
}

export function applyAction(
  session: SessionState,
  playerId: string,
  action: GameAction,
): ApplyResult {
  if (session.phase !== 'playing' || !session.gameState) {
    return { ok: false, reason: 'Game has not started yet.' };
  }

  switch (session.gameState.type) {
    case 'license-plates':
      return applyLicensePlatesAction(session, playerId, action);
    case 'bingo':
      return applyBingoAction(session, playerId, action);
    case 'sign-game':
      return applySignGameAction(session, playerId, action);
    default:
      return { ok: false, reason: 'Unknown game type.' };
  }
}

export function addPlayer(session: SessionState, player: Player): SessionState {
  if (session.players.some((entry) => entry.id === player.id)) {
    return session;
  }
  return {
    ...session,
    players: [...session.players, player],
  };
}

export function removePlayer(session: SessionState, playerId: string): SessionState {
  return {
    ...session,
    players: session.players.filter((player) => player.id !== playerId),
  };
}

export function rejectAction(
  session: SessionState,
  playerId: string,
  reason: string,
): SessionState {
  return {
    ...session,
    lastRejection: { playerId, reason },
  };
}
