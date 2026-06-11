import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cloneGameRules, DEFAULT_GAME_RULES } from '../data/defaultPreferences';
import {
  addPlayer,
  applyAction,
  finishGame,
  startGame,
} from './ruleEngine';
import { playerFromLocal, testSession } from './testUtils';

describe('license plates', () => {
  it('claims an open plate', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('abc', host, 'license-plates'));
    const guest = playerFromLocal('guest', 'Guest', false);
    session = addPlayer(session, guest);

    const result = applyAction(session, 'guest', {
      type: 'CLAIM_PLATE',
      plateCode: 'TX',
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.state.gameState?.type, 'license-plates');
      if (result.state.gameState?.type === 'license-plates') {
        assert.equal(result.state.gameState.claims.TX, 'guest');
      }
    }
  });

  it('rejects duplicate claims', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('abc', host, 'license-plates'));
    session = addPlayer(session, playerFromLocal('guest', 'Guest', false));

    const claim = applyAction(session, 'guest', {
      type: 'CLAIM_PLATE',
      plateCode: 'CA',
    });
    assert.equal(claim.ok, true);
    if (!claim.ok) return;

    const second = applyAction(claim.state, 'host', {
      type: 'CLAIM_PLATE',
      plateCode: 'CA',
    });
    assert.equal(second.ok, false);
    if (!second.ok) {
      assert.match(second.reason, /Guest/);
    }
  });

  it('blocks unclaim when house rule is off', () => {
    const host = playerFromLocal('host', 'Host', true);
    const rules = cloneGameRules(DEFAULT_GAME_RULES);
    rules['license-plates'].allowUnclaim = false;
    let session = startGame(testSession('abc', host, 'license-plates', rules));

    session = (applyAction(session, 'host', {
      type: 'CLAIM_PLATE',
      plateCode: 'TX',
    }) as { ok: true; state: typeof session }).state;

    const unclaim = applyAction(session, 'host', {
      type: 'UNCLAIM_PLATE',
      plateCode: 'TX',
    });
    assert.equal(unclaim.ok, false);
    if (!unclaim.ok) {
      assert.match(unclaim.reason, /turned off/);
    }
  });

  it('finishes with the highest plate count as winner', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('abc', host, 'license-plates'));
    session = addPlayer(session, playerFromLocal('guest', 'Guest', false));

    session = (applyAction(session, 'host', {
      type: 'CLAIM_PLATE',
      plateCode: 'TX',
    }) as { ok: true; state: typeof session }).state;

    session = (applyAction(session, 'guest', {
      type: 'CLAIM_PLATE',
      plateCode: 'CA',
    }) as { ok: true; state: typeof session }).state;

    session = (applyAction(session, 'guest', {
      type: 'CLAIM_PLATE',
      plateCode: 'NY',
    }) as { ok: true; state: typeof session }).state;

    const finished = finishGame(session);
    assert.equal(finished.phase, 'finished');
    assert.equal(finished.winnerId, 'guest');
  });
});

describe('sign game', () => {
  it('accepts valid words and advances letters', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('abc', host, 'sign-game'));

    const apple = applyAction(session, 'host', {
      type: 'SUBMIT_SIGN_WORD',
      letter: 'A',
      word: 'Applebee',
    });
    assert.equal(apple.ok, true);
    if (apple.ok && apple.state.gameState?.type === 'sign-game') {
      assert.equal(apple.state.gameState.playerLetters.host, 'B');
    }
  });

  it('rejects duplicate words', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = testSession('abc', host, 'sign-game');
    session = addPlayer(session, playerFromLocal('guest', 'Guest', false));
    session = startGame(session);

    session = (applyAction(session, 'host', {
      type: 'SUBMIT_SIGN_WORD',
      letter: 'A',
      word: 'Airport',
    }) as { ok: true; state: typeof session }).state;

    const dup = applyAction(session, 'guest', {
      type: 'SUBMIT_SIGN_WORD',
      letter: 'A',
      word: 'airport',
    });
    assert.equal(dup.ok, false);
  });

  it('allows duplicate words when house rule is on', () => {
    const host = playerFromLocal('host', 'Host', true);
    const rules = cloneGameRules(DEFAULT_GAME_RULES);
    rules['sign-game'].allowDuplicateWords = true;
    let session = testSession('abc', host, 'sign-game', rules);
    session = addPlayer(session, playerFromLocal('guest', 'Guest', false));
    session = startGame(session);

    session = (applyAction(session, 'host', {
      type: 'SUBMIT_SIGN_WORD',
      letter: 'A',
      word: 'Airport',
    }) as { ok: true; state: typeof session }).state;

    const dup = applyAction(session, 'guest', {
      type: 'SUBMIT_SIGN_WORD',
      letter: 'A',
      word: 'airport',
    });
    assert.equal(dup.ok, true);
  });

  it('allows Q words with letter anywhere', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('abc', host, 'sign-game'));
    if (session.gameState?.type !== 'sign-game') return;

    const letters = 'ABCDEFGHIJKLMNOP';
    for (const letter of letters) {
      const result = applyAction(session, 'host', {
        type: 'SUBMIT_SIGN_WORD',
        letter,
        word: `${letter}word`,
      });
      assert.equal(result.ok, true);
      if (result.ok) session = result.state;
    }

    const q = applyAction(session, 'host', {
      type: 'SUBMIT_SIGN_WORD',
      letter: 'Q',
      word: 'BBQ',
    });
    assert.equal(q.ok, true);
  });

  it('requires Q words to start with Q when house rule is starts-with', () => {
    const host = playerFromLocal('host', 'Host', true);
    const rules = cloneGameRules(DEFAULT_GAME_RULES);
    rules['sign-game'].qxzMatchMode = 'starts-with';
    let session = startGame(testSession('abc', host, 'sign-game', rules));
    if (session.gameState?.type !== 'sign-game') return;

    const letters = 'ABCDEFGHIJKLMNOP';
    for (const letter of letters) {
      session = (applyAction(session, 'host', {
        type: 'SUBMIT_SIGN_WORD',
        letter,
        word: `${letter}word`,
      }) as { ok: true; state: typeof session }).state;
    }

    const q = applyAction(session, 'host', {
      type: 'SUBMIT_SIGN_WORD',
      letter: 'Q',
      word: 'BBQ',
    });
    assert.equal(q.ok, false);
  });
});

describe('bingo', () => {
  it('detects a row bingo', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('abc', host, 'bingo'));
    if (session.gameState?.type !== 'bingo') return;

    const marked = session.gameState.marked.host;
    for (let index = 0; index < 5; index += 1) {
      if (marked[index]) continue;
      const result = applyAction(session, 'host', { type: 'MARK_BINGO', index });
      assert.equal(result.ok, true);
      if (result.ok) session = result.state;
    }

    assert.equal(session.winnerId, 'host');
  });

  it('does not win on a line when blackout mode is enabled', () => {
    const host = playerFromLocal('host', 'Host', true);
    const rules = cloneGameRules(DEFAULT_GAME_RULES);
    rules.bingo.winMode = 'blackout';
    let session = startGame(testSession('abc', host, 'bingo', rules));
    if (session.gameState?.type !== 'bingo') return;

    const marked = session.gameState.marked.host;
    for (let index = 0; index < 5; index += 1) {
      if (marked[index]) continue;
      const result = applyAction(session, 'host', { type: 'MARK_BINGO', index });
      assert.equal(result.ok, true);
      if (result.ok) session = result.state;
    }

    assert.equal(session.winnerId, null);
  });
});
