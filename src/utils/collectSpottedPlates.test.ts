import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { collectNewlySpottedPlates } from './collectSpottedPlates';
import { playerFromLocal, testSession } from '../games/testUtils';
import { applyAction, addPlayer, startGame } from '../games/ruleEngine';

describe('collectNewlySpottedPlates', () => {
  it('records a plate the local player just claimed', () => {
    const host = playerFromLocal('host', 'Dad', true);
    const previous = startGame(testSession('trip', host, 'license-plates'));
    const next = (
      applyAction(previous, 'host', { type: 'CLAIM_PLATE', plateCode: 'TX' }) as {
        ok: true;
        state: typeof previous;
      }
    ).state;

    assert.deepEqual(collectNewlySpottedPlates(previous, next, 'host'), ['TX']);
  });

  it('does not record someone else claiming', () => {
    const host = playerFromLocal('host', 'Dad', true);
    let session = startGame(testSession('trip', host, 'license-plates'));
    session = addPlayer(session, playerFromLocal('guest', 'Emma', false));
    const next = (
      applyAction(session, 'guest', { type: 'CLAIM_PLATE', plateCode: 'CA' }) as {
        ok: true;
        state: typeof session;
      }
    ).state;

    assert.deepEqual(collectNewlySpottedPlates(session, next, 'host'), []);
    assert.deepEqual(collectNewlySpottedPlates(session, next, 'guest'), ['CA']);
  });
});
