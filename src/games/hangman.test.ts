import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAction,
  addPlayer,
  finishGame,
  startGame,
} from './ruleEngine';
import {
  buildHangmanMask,
  HANGMAN_SOLO_PUZZLE_ID,
  stripHangmanSecret,
} from './hangman';
import { getSessionWinnerDisplay } from '../utils/winnerLabel';
import { playerFromLocal, testSession } from './testUtils';

function guessWord(session: ReturnType<typeof startGame>, playerId: string, word: string) {
  let next = session;
  const unique = [...new Set(word.replace(/ /g, '').split(''))];
  for (const letter of unique) {
    const result = applyAction(next, playerId, { type: 'GUESS_HANGMAN_LETTER', letter });
    assert.equal(result.ok, true);
    if (result.ok) {
      next = result.state;
    }
  }
  return next;
}

describe('hangman', () => {
  it('builds a mask that keeps spaces', () => {
    assert.equal(buildHangmanMask('CAT NAP', ['C', 'T', 'N', 'P']), 'C _ T   N _ P');
  });

  it('rejects duplicate letters', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('trip', host, 'hangman'));
    session = (
      applyAction(session, 'host', {
        type: 'SUBMIT_HANGMAN_SECRET',
        phrase: 'CAT',
      }) as { ok: true; state: typeof session }
    ).state;
    session = (
      applyAction(session, 'host', {
        type: 'GUESS_HANGMAN_LETTER',
        letter: 'A',
      }) as { ok: true; state: typeof session }
    ).state;
    const dup = applyAction(session, 'host', { type: 'GUESS_HANGMAN_LETTER', letter: 'A' });
    assert.equal(dup.ok, false);
  });

  it('lets the solo guesser win without swapping', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('trip', host, 'hangman'));
    session = (
      applyAction(session, 'host', {
        type: 'SUBMIT_HANGMAN_SECRET',
        phrase: 'HI',
      }) as { ok: true; state: typeof session }
    ).state;
    session = guessWord(session, 'host', 'HI');
    assert.equal(session.phase, 'finished');
    assert.equal(session.winnerId, 'host');
  });

  it('records a solo hangman-out as a puzzle loss', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('trip', host, 'hangman'));
    session = (
      applyAction(session, 'host', {
        type: 'SUBMIT_HANGMAN_SECRET',
        phrase: 'ZZZ',
      }) as { ok: true; state: typeof session }
    ).state;
    for (const letter of ['A', 'B', 'C', 'D', 'E', 'F']) {
      session = (
        applyAction(session, 'host', {
          type: 'GUESS_HANGMAN_LETTER',
          letter,
        }) as { ok: true; state: typeof session }
      ).state;
    }
    assert.equal(session.winnerId, HANGMAN_SOLO_PUZZLE_ID);
    assert.equal(session.phase, 'finished');
    const display = getSessionWinnerDisplay(session, 'host');
    assert.equal(display?.outcome, 'loss');
    assert.equal(display?.headline, 'Hit the road, Jack!');
  });

  it('awards the guesser, swaps roles, and wins first to 5', () => {
    const host = playerFromLocal('host', 'Host', true);
    const guest = playerFromLocal('guest', 'Guest', false);
    let session = addPlayer(testSession('trip', host, 'hangman'), guest);
    session = startGame(session);
    assert.equal(session.gameState?.type, 'hangman');
    if (session.gameState?.type !== 'hangman') {
      return;
    }
    assert.equal(session.gameState.supplierId, 'host');
    assert.equal(session.gameState.guesserId, 'guest');

    for (let round = 0; session.phase !== 'finished' && round < 20; round += 1) {
      const supplierId =
        session.gameState?.type === 'hangman' ? session.gameState.supplierId : null;
      const guesserId =
        session.gameState?.type === 'hangman' ? session.gameState.guesserId : null;
      assert.ok(supplierId && guesserId);
      session = (
        applyAction(session, supplierId, {
          type: 'SUBMIT_HANGMAN_SECRET',
          phrase: 'GO',
        }) as { ok: true; state: typeof session }
      ).state;
      session = guessWord(session, guesserId, 'GO');
    }

    assert.equal(session.phase, 'finished');
    assert.equal(session.winnerId, 'guest');
    if (session.gameState?.type === 'hangman') {
      assert.equal(session.gameState.scores.guest, 5);
    }
  });

  it('awards the supplier when the hangman completes', () => {
    const host = playerFromLocal('host', 'Host', true);
    const guest = playerFromLocal('guest', 'Guest', false);
    let session = startGame(addPlayer(testSession('trip', host, 'hangman'), guest));
    session = (
      applyAction(session, 'host', {
        type: 'SUBMIT_HANGMAN_SECRET',
        phrase: 'ZZZ',
      }) as { ok: true; state: typeof session }
    ).state;
    for (const letter of ['A', 'B', 'C', 'D', 'E', 'F']) {
      session = (
        applyAction(session, 'guest', {
          type: 'GUESS_HANGMAN_LETTER',
          letter,
        }) as { ok: true; state: typeof session }
      ).state;
    }
    assert.equal(session.gameState?.type, 'hangman');
    if (session.gameState?.type === 'hangman') {
      assert.equal(session.gameState.scores.host, 1);
      assert.equal(session.gameState.roundPhase, 'awaiting-secret');
      assert.equal(session.gameState.supplierId, 'guest');
      assert.equal(session.gameState.guesserId, 'host');
    }
  });

  it('strips the secret from guesser-facing snapshots', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('trip', host, 'hangman'));
    session = (
      applyAction(session, 'host', {
        type: 'SUBMIT_HANGMAN_SECRET',
        phrase: 'SECRET',
      }) as { ok: true; state: typeof session }
    ).state;
    const stripped = stripHangmanSecret(session);
    assert.equal(stripped.gameState?.type, 'hangman');
    if (stripped.gameState?.type === 'hangman') {
      assert.equal(stripped.gameState.secretWord, null);
      assert.match(stripped.gameState.displayMask, /_/);
    }
  });

  it('uses scores when the host ends early', () => {
    const host = playerFromLocal('host', 'Host', true);
    const guest = playerFromLocal('guest', 'Guest', false);
    let session = startGame(addPlayer(testSession('trip', host, 'hangman'), guest));
    session = (
      applyAction(session, 'host', {
        type: 'SUBMIT_HANGMAN_SECRET',
        phrase: 'HI',
      }) as { ok: true; state: typeof session }
    ).state;
    session = guessWord(session, 'guest', 'HI');
    session = finishGame(session);
    assert.equal(session.winnerId, 'guest');
  });
});
