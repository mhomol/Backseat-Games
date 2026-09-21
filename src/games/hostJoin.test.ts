import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveIncomingJoin } from './hostJoin';
import { playerFromLocal, testSession } from './testUtils';
import { addPlayer, startGame } from './ruleEngine';

describe('resolveIncomingJoin', () => {
  it('re-welcomes the same passenger name without duplicating', () => {
    const host = playerFromLocal('host', 'Dad', true);
    let session = startGame(testSession('trip', host, 'bingo'));
    session = addPlayer(session, playerFromLocal('guest-1', 'Emma', false));

    const result = resolveIncomingJoin(session, 'Emma', 'new-id', (id, name) =>
      playerFromLocal(id, name, false),
    );

    assert.equal(result.kind, 'rewelcome');
    if (result.kind === 'rewelcome') {
      assert.equal(result.playerId, 'guest-1');
    }
  });

  it('adds a new passenger', () => {
    const host = playerFromLocal('host', 'Dad', true);
    const session = startGame(testSession('trip', host, 'bingo'));
    const result = resolveIncomingJoin(session, 'Sam', 'sam-id', (id, name) =>
      playerFromLocal(id, name, false),
    );

    assert.equal(result.kind, 'new');
    if (result.kind === 'new') {
      assert.equal(result.player.id, 'sam-id');
      assert.equal(result.nextSession.players.length, 2);
    }
  });
});
