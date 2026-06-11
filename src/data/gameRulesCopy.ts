import type { GameType } from '../types/game';
import type { GameRules } from '../types/preferences';

export const GAME_RULES_TITLE: Record<GameType, string> = {
  'license-plates': 'License Plates',
  'sign-game': 'Sign Game',
  bingo: 'Travel Bingo',
};

export function summarizeGameRules(gameType: GameType, rules: GameRules): string[] {
  switch (gameType) {
    case 'sign-game': {
      const sign = rules['sign-game'];
      return [
        sign.qxzMatchMode === 'anywhere'
          ? 'Q, X, Z: letter anywhere in the word'
          : 'Q, X, Z: word must start with the letter',
        sign.allowDuplicateWords ? 'Duplicate words allowed' : 'No duplicate words',
        sign.enableRecordings ? 'Mic recordings on' : 'Typing only (no recordings)',
      ];
    }
    case 'license-plates':
      return [
        rules['license-plates'].allowUnclaim
          ? 'Players can unclaim their plates'
          : 'Plates stay claimed once tapped',
      ];
    case 'bingo':
      return [
        rules.bingo.winMode === 'line'
          ? 'Win on any row, column, or diagonal'
          : 'Win by marking the full card',
      ];
    default:
      return [];
  }
}
