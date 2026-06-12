import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { clonePlayerStats, DEFAULT_PLAYER_STATS } from '../data/defaultStats';
import { finishGame, startGame } from '../games/ruleEngine';
import { playerFromLocal, testSession } from '../games/testUtils';
import { recordGameResult } from './recordGameResult';

function finishedSession(winnerId: string | null) {
  const host = playerFromLocal('host', 'Host', true);
  let session = startGame(testSession('abc', host, 'license-plates'));
  session = { ...session, phase: 'finished' as const, winnerId };
  return session;
}

describe('recordGameResult', () => {
  it('records a win for the local winner', () => {
    const session = finishedSession('host');
    const result = recordGameResult(DEFAULT_PLAYER_STATS, null, session, 'host');
    assert.equal(result.recorded, true);
    assert.equal(result.stats.byGame['license-plates'].wins, 1);
    assert.equal(result.stats.byGame['license-plates'].losses, 0);
    assert.equal(result.stats.byGame['license-plates'].ties, 0);
    assert.equal(result.stats.lastRecordedSessionId, 'abc');
  });

  it('records a loss when another player wins', () => {
    const session = finishedSession('guest');
    const result = recordGameResult(DEFAULT_PLAYER_STATS, null, session, 'host');
    assert.equal(result.recorded, true);
    assert.equal(result.stats.byGame['license-plates'].losses, 1);
  });

  it('records a tie when there is no single winner', () => {
    const host = playerFromLocal('host', 'Host', true);
    let session = startGame(testSession('abc', host, 'license-plates'));
    session = finishGame(session);
    assert.equal(session.winnerId, null);

    const result = recordGameResult(DEFAULT_PLAYER_STATS, null, session, 'host');
    assert.equal(result.recorded, true);
    assert.equal(result.stats.byGame['license-plates'].ties, 1);
  });

  it('does not double-count the same session', () => {
    const session = finishedSession('host');
    const first = recordGameResult(DEFAULT_PLAYER_STATS, null, session, 'host');
    const second = recordGameResult(first.stats, session, session, 'host');
    assert.equal(second.recorded, false);
    assert.equal(second.stats.byGame['license-plates'].wins, 1);
  });

  it('skips sessions that are not finished', () => {
    const host = playerFromLocal('host', 'Host', true);
    const session = startGame(testSession('abc', host, 'bingo'));
    const result = recordGameResult(DEFAULT_PLAYER_STATS, null, session, 'host');
    assert.equal(result.recorded, false);
    assert.deepEqual(result.stats, DEFAULT_PLAYER_STATS);
  });

  it('skips when game type is missing', () => {
    const session = {
      ...finishedSession('host'),
      gameType: null,
    };
    const result = recordGameResult(DEFAULT_PLAYER_STATS, null, session, 'host');
    assert.equal(result.recorded, false);
  });

  it('does not record again when already finished in previous snapshot', () => {
    const session = finishedSession('host');
    const stats = clonePlayerStats({
      ...DEFAULT_PLAYER_STATS,
      lastRecordedSessionId: 'abc',
      byGame: {
        ...DEFAULT_PLAYER_STATS.byGame,
        'license-plates': { wins: 1, losses: 0, ties: 0 },
      },
    });
    const result = recordGameResult(stats, session, session, 'host');
    assert.equal(result.recorded, false);
    assert.equal(result.stats.byGame['license-plates'].wins, 1);
  });
});
