import type {
  ApplyResult,
  GameAction,
  GameType,
  Player,
  SessionState,
} from '../types/game';
import type { GameRules } from '../types/preferences';
import { createBingoState, applyBingoAction } from './bingo';
import { applyColorCatchAction, createColorCatchState, getColorCatchMarkCount } from './colorCatch';
import { applyHangmanAction, createHangmanState, resolveHangmanWinner } from './hangman';
import {
  applyLicensePlatesAction,
  createLicensePlatesState,
  resolveLicensePlateWinner,
} from './licensePlates';
import { applySignGameAction, createSignGameState, getSignGameLeaderboard } from './signGame';

export function createSession(
  sessionId: string,
  host: Player,
  gameType: GameType,
  gameRules: GameRules,
): SessionState {
  return {
    sessionId,
    phase: 'lobby',
    gameType,
    players: [host],
    hostId: host.id,
    gameRules,
    gameState: null,
    winnerId: null,
    lastRejection: null,
  };
}

export function returnToLobby(session: SessionState): SessionState {
  return {
    ...session,
    phase: 'lobby',
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
    case 'hangman':
      gameState = createHangmanState(session);
      break;
    case 'color-catch':
      gameState = createColorCatchState(session);
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
    case 'hangman':
      return applyHangmanAction(session, playerId, action);
    case 'color-catch':
      return applyColorCatchAction(session, playerId, action);
    default:
      return { ok: false, reason: 'Unknown game type.' };
  }
}

export function finishGame(session: SessionState): SessionState {
  if (session.phase !== 'playing' || !session.gameState) {
    return session;
  }

  if (session.winnerId) {
    return { ...session, phase: 'finished' };
  }

  switch (session.gameState.type) {
    case 'license-plates':
      return {
        ...session,
        phase: 'finished',
        winnerId: resolveLicensePlateWinner(session),
      };
    case 'bingo': {
      if (session.gameState.winnerId) {
        return {
          ...session,
          phase: 'finished',
          winnerId: session.gameState.winnerId,
        };
      }
      const markCounts = session.players.map((player) => {
        const marked = session.gameState?.type === 'bingo'
          ? session.gameState.marked[player.id]
          : undefined;
        return {
          playerId: player.id,
          count: marked?.filter(Boolean).length ?? 0,
        };
      });
      const maxMarks = Math.max(...markCounts.map((entry) => entry.count));
      const leaders = markCounts.filter((entry) => entry.count === maxMarks);
      return {
        ...session,
        phase: 'finished',
        winnerId: maxMarks > 0 && leaders.length === 1 ? leaders[0].playerId : null,
      };
    }
    case 'sign-game': {
      if (session.gameState.winnerId) {
        return {
          ...session,
          phase: 'finished',
          winnerId: session.gameState.winnerId,
        };
      }
      const board = getSignGameLeaderboard(session.gameState, session.players);
      const maxLetters = board[0]?.lettersDone ?? 0;
      const leaders = board.filter((entry) => entry.lettersDone === maxLetters);
      return {
        ...session,
        phase: 'finished',
        winnerId: maxLetters > 0 && leaders.length === 1 ? leaders[0].playerId : null,
      };
    }
    case 'hangman':
      return {
        ...session,
        phase: 'finished',
        winnerId: resolveHangmanWinner(session),
      };
    case 'color-catch': {
      const colorState = session.gameState;
      if (colorState.winnerId) {
        return {
          ...session,
          phase: 'finished',
          winnerId: colorState.winnerId,
        };
      }
      const markCounts = session.players.map((player) => ({
        playerId: player.id,
        count: getColorCatchMarkCount(colorState, player.id),
      }));
      const maxMarks = Math.max(...markCounts.map((entry) => entry.count));
      const leaders = markCounts.filter((entry) => entry.count === maxMarks);
      return {
        ...session,
        phase: 'finished',
        winnerId: maxMarks > 0 && leaders.length === 1 ? leaders[0].playerId : null,
      };
    }
    default:
      return { ...session, phase: 'finished' };
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
