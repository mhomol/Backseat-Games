import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_GAME_RULES } from '../data/defaultPreferences';
import type { SessionState } from '../types/game';
import {
  consumeRoundStartOpportunity,
  resetRoundStartCueForTests,
  roundStartSoundKey,
} from './gameSoundCues';

function session(partial: Partial<SessionState>): SessionState {
  return {
    sessionId: 'trip',
    phase: 'playing',
    gameType: 'license-plates',
    players: [],
    hostId: 'host',
    gameRules: DEFAULT_GAME_RULES,
    themeId: 'classic',
    gameState: { type: 'license-plates', claims: {} },
    winnerId: null,
    lastRejection: null,
    ...partial,
  };
}

describe('roundStartSoundKey', () => {
  it('keys a plates/bingo/sign/color-catch game once while playing', () => {
    const playing = session({ sessionId: 'abc' });
    assert.equal(roundStartSoundKey(playing), 'abc:playing');
    assert.equal(roundStartSoundKey({ ...playing, phase: 'finished' }), null);
    assert.equal(roundStartSoundKey(null), null);
  });

  it('keys Hangman per round so the next word gets a sting', () => {
    const hangman = session({
      gameType: 'hangman',
      gameState: {
        type: 'hangman',
        mode: 'solo',
        round: 2,
        supplierId: null,
        guesserId: 'host',
        secretWord: null,
        displayMask: '',
        guessedLetters: [],
        missCount: 0,
        maxMisses: 6,
        scores: {},
        roundPhase: 'awaiting-secret',
        winnerId: null,
        soloDifficulty: 'medium',
      },
    });
    assert.equal(roundStartSoundKey(hangman), 'trip:hangman:2');
  });
});

describe('consumeRoundStartOpportunity', () => {
  it('fires once per key and again after the session leaves playing', () => {
    resetRoundStartCueForTests();
    assert.equal(consumeRoundStartOpportunity('abc:playing'), true);
    assert.equal(consumeRoundStartOpportunity('abc:playing'), false);
    assert.equal(consumeRoundStartOpportunity(null), false);
    assert.equal(consumeRoundStartOpportunity('abc:playing'), true);
  });
});
