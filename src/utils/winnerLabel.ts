import type { SessionState } from '../types/game';
import { getLicensePlateScores } from '../games/licensePlates';
import { getSignGameLeaderboard } from '../games/signGame';

function bingoMarkCount(session: SessionState, playerId: string): number {
  if (session.gameState?.type !== 'bingo') {
    return 0;
  }
  const marked = session.gameState.marked[playerId];
  return marked?.filter(Boolean).length ?? 0;
}

function tiedLeaderNames(session: SessionState, leaderIds: string[]): string {
  const names = leaderIds
    .map((id) => session.players.find((p) => p.id === id)?.name ?? 'Someone')
    .filter(Boolean);
  if (names.length === 0) {
    return "It's a tie!";
  }
  if (names.length === 1) {
    return names[0];
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export function getSessionWinnerDisplay(
  session: SessionState,
  localPlayerId: string,
): { headline: string; isYou: boolean } | null {
  if (session.phase !== 'finished') {
    return null;
  }

  if (session.winnerId) {
    const isYou = session.winnerId === localPlayerId;
    const name = session.players.find((p) => p.id === session.winnerId)?.name ?? 'Someone';
    return { headline: isYou ? 'You' : name, isYou };
  }

  let leaders: string[] = [];
  if (session.gameState?.type === 'license-plates') {
    const scores = getLicensePlateScores(session.gameState, session.players);
    const max = Math.max(...session.players.map((p) => scores[p.id] ?? 0));
    if (max <= 0) {
      return { headline: 'Nobody scored', isYou: false };
    }
    leaders = session.players.filter((p) => (scores[p.id] ?? 0) === max).map((p) => p.id);
  } else if (session.gameState?.type === 'sign-game') {
    const board = getSignGameLeaderboard(session.gameState, session.players);
    const max = board[0]?.lettersDone ?? 0;
    if (max <= 0) {
      return { headline: 'Nobody scored', isYou: false };
    }
    leaders = board.filter((e) => e.lettersDone === max).map((e) => e.playerId);
  } else if (session.gameState?.type === 'bingo') {
    const max = Math.max(...session.players.map((p) => bingoMarkCount(session, p.id)));
    if (max <= 0) {
      return { headline: 'Nobody scored', isYou: false };
    }
    leaders = session.players.filter((p) => bingoMarkCount(session, p.id) === max).map((p) => p.id);
  }

  if (leaders.length === 1) {
    const isYou = leaders[0] === localPlayerId;
    const name = session.players.find((p) => p.id === leaders[0])?.name ?? 'Someone';
    return { headline: isYou ? 'You' : name, isYou };
  }

  return {
    headline: tiedLeaderNames(session, leaders),
    isYou: false,
  };
}
