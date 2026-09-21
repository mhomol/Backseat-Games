import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  beginRelayReconnect,
  isHostGoneHubError,
  resumeRelayAfterReconnect,
} from './relayReconnect';

describe('resumeRelayAfterReconnect', () => {
  it('marks reconnecting then connected and re-registers a host', async () => {
    const statuses: string[] = [];
    let registered = 0;
    let joins = 0;

    beginRelayReconnect((status) => {
      statuses.push(status);
    });

    await resumeRelayAfterReconnect({
      hosting: true,
      joinCode: 'AB12CD',
      displayName: 'Dad',
      registerInRoom: async () => {
        registered += 1;
      },
      routeJoinMessage: async () => {
        joins += 1;
      },
      onStatus: (status) => {
        statuses.push(status);
      },
    });

    assert.equal(registered, 1);
    assert.equal(joins, 0);
    assert.deepEqual(statuses, ['reconnecting', 'connected']);
  });

  it('re-sends JOIN for a guest', async () => {
    let joinCodeSent: string | null = null;
    let nameSent: string | null = null;

    await resumeRelayAfterReconnect({
      hosting: false,
      joinCode: 'XY99ZZ',
      displayName: 'Emma',
      registerInRoom: async () => {},
      routeJoinMessage: async (joinCode, displayName) => {
        joinCodeSent = joinCode;
        nameSent = displayName;
      },
      onStatus: () => {},
    });

    assert.equal(joinCodeSent, 'XY99ZZ');
    assert.equal(nameSent, 'Emma');
  });

  it('treats host-missing JOIN as host gone without failing reconnect', async () => {
    let hostGone = false;

    await resumeRelayAfterReconnect({
      hosting: false,
      joinCode: 'XY99ZZ',
      displayName: 'Emma',
      registerInRoom: async () => {},
      routeJoinMessage: async () => {
        throw new Error('Host is not connected yet.');
      },
      onStatus: () => {},
      onHostGone: () => {
        hostGone = true;
      },
    });

    assert.equal(hostGone, true);
  });
});

describe('isHostGoneHubError', () => {
  it('matches the relay hub copy', () => {
    assert.equal(isHostGoneHubError(new Error('Host is not connected yet.')), true);
    assert.equal(isHostGoneHubError(new Error('Room expired.')), false);
  });
});
