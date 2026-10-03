import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cloneGameRules, DEFAULT_GAME_RULES } from '../data/defaultPreferences';
import { FREE_CENTER_INDEX } from './bingo';
import { applyAction, addPlayer, finishGame, startGame } from './ruleEngine';
import { playerFromLocal, testSession } from './testUtils';

describe('color catch', () => {
  it('marks the free center and keeps unique cards', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('trip', host, 'color-catch'));
    session = addPlayer(session, playerFromLocal('guest', 'Guest', false));
    session = startGame(session);
    assert.equal(session.gameState?.type, 'color-catch');
    if (session.gameState?.type !== 'color-catch') {
      return;
    }
    assert.equal(session.gameState.marked.host[FREE_CENTER_INDEX], true);
    assert.notDeepEqual(session.gameState.cards.host.itemIds, session.gameState.cards.guest.itemIds);
  });

  it('wins on a completed line', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('trip', host, 'color-catch'));
    if (session.gameState?.type !== 'color-catch') {
      return;
    }

    const marked = session.gameState.marked.host;
    for (let index = 0; index < 5; index += 1) {
      if (marked[index]) {
        continue;
      }
      const result = applyAction(session, 'host', { type: 'MARK_COLOR_CATCH', index });
      assert.equal(result.ok, true);
      if (result.ok) {
        session = result.state;
      }
    }

    assert.equal(session.winnerId, 'host');
  });

  it('does not win on a line in blackout mode', () => {
    const host = playerFromLocal('host', 'Host', true);
    const rules = cloneGameRules(DEFAULT_GAME_RULES);
    rules['color-catch'].winMode = 'blackout';
    let session = startGame(testSession('trip', host, 'color-catch', rules));
    if (session.gameState?.type !== 'color-catch') {
      return;
    }

    const marked = session.gameState.marked.host;
    for (let index = 0; index < 5; index += 1) {
      if (marked[index]) {
        continue;
      }
      const result = applyAction(session, 'host', { type: 'MARK_COLOR_CATCH', index });
      assert.equal(result.ok, true);
      if (result.ok) {
        session = result.state;
      }
    }

    assert.equal(session.winnerId, null);
  });
});
