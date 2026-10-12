import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cloneGameRules, DEFAULT_GAME_RULES } from '../data/defaultPreferences';
import { applyAction, addPlayer, startGame } from './ruleEngine';
import { colorCatchFreeCenterIndex, generateColorCatchCard } from './colorCatch';
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
    assert.equal(session.gameState.gridSize, 5);
    assert.equal(session.gameState.marked.host[colorCatchFreeCenterIndex(5)], true);
    assert.notDeepEqual(session.gameState.cards.host.itemIds, session.gameState.cards.guest.itemIds);
  });

  it('builds a 3×3 easy board with the middle marked', () => {
    const host = playerFromLocal('host', 'Host', true);
    const rules = cloneGameRules(DEFAULT_GAME_RULES);
    rules['color-catch'].difficulty = 'easy';
    const session = startGame(testSession('trip', host, 'color-catch', rules));
    assert.equal(session.gameState?.type, 'color-catch');
    if (session.gameState?.type !== 'color-catch') {
      return;
    }
    assert.equal(session.gameState.gridSize, 3);
    assert.equal(session.gameState.cards.host.itemIds.length, 8);
    assert.equal(session.gameState.marked.host.length, 9);
    assert.equal(session.gameState.marked.host[colorCatchFreeCenterIndex(3)], true);
  });

  it('shuffles colors per player and per game', () => {
    const first = generateColorCatchCard('trip-a', 'host', 5, 'salt-1');
    const second = generateColorCatchCard('trip-a', 'guest', 5, 'salt-1');
    const third = generateColorCatchCard('trip-a', 'host', 5, 'salt-2');
    assert.notDeepEqual(first.itemIds, second.itemIds);
    assert.notDeepEqual(first.itemIds, third.itemIds);
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

  it('wins an easy card on a completed 3-square line', () => {
    const host = playerFromLocal('host', 'Host', true);
    const rules = cloneGameRules(DEFAULT_GAME_RULES);
    rules['color-catch'].difficulty = 'easy';
    let session = startGame(testSession('trip', host, 'color-catch', rules));
    if (session.gameState?.type !== 'color-catch') {
      return;
    }

    for (const index of [0, 1, 2]) {
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
