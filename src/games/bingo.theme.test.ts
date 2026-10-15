import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { holidayBingoItems } from '../data/bingoPools';
import { DEFAULT_GAME_RULES } from '../data/defaultPreferences';
import { generateBingoCard, getBingoSquareLabel } from './bingo';
import { playerFromLocal, testSession } from './testUtils';
import { startGame } from './ruleEngine';

describe('themed bingo', () => {
  it('adds holiday ids to the Thanksgiving pool and still deals 24 squares', () => {
    const extra = holidayBingoItems('thanksgiving').map((item) => item.id);
    assert.ok(extra.includes('inflatable-turkey'));
    const card = generateBingoCard('tg-session', 'host', 'thanksgiving');
    assert.equal(card.itemIds.length, 24);
  });

  it('unknown item ids render a placeholder instead of throwing', () => {
    const square = getBingoSquareLabel({ itemIds: ['not-a-real-item'], freeCenter: true }, 0);
    assert.equal(square.label, '???');
    assert.equal(square.id, 'not-a-real-item');
  });

  it('session themeId drives card generation', () => {
    const host = playerFromLocal('host', 'Host', true);
    const session = startGame(testSession('xmas-bingo', host, 'bingo', DEFAULT_GAME_RULES, 'christmas'));
    assert.equal(session.themeId, 'christmas');
    assert.equal(session.gameState?.type, 'bingo');
  });
});
