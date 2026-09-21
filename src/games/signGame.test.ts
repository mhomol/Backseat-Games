import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getSignWordRejection } from './signGame';
import { playerFromLocal, testSession } from './testUtils';
import { startGame } from './ruleEngine';

describe('getSignWordRejection', () => {
  it('returns a reason without applying the word', () => {
    const host = playerFromLocal('host', 'Dad', true);
    const session = startGame(testSession('trip', host, 'sign-game'));
    const rejection = getSignWordRejection(session, 'host', {
      type: 'SUBMIT_SIGN_WORD',
      letter: 'A',
      word: 'xyz',
    });

    assert.ok(rejection);
    assert.equal(session.gameState?.type, 'sign-game');
    if (session.gameState?.type === 'sign-game') {
      assert.equal(session.gameState.playerLetters.host, 'A');
      assert.equal(session.gameState.submissions.length, 0);
    }
  });

  it('allows a matching word', () => {
    const host = playerFromLocal('host', 'Dad', true);
    const session = startGame(testSession('trip', host, 'sign-game'));
    const rejection = getSignWordRejection(session, 'host', {
      type: 'SUBMIT_SIGN_WORD',
      letter: 'A',
      word: 'Airport',
    });

    assert.equal(rejection, null);
  });
});
