import test from 'node:test';
import assert from 'node:assert/strict';

import { createRoomRecord, getRoomRecord, saveRoomRecord } from '../lib/room-store.mjs';

test('createRoomRecord stores new room and preserves expiry metadata', () => {
  const now = Date.now();
  const room = createRoomRecord('AB12C', 'Alice', now);

  assert.equal(room.code, 'AB12C');
  assert.equal(room.version, 0);
  assert.equal(room.expires > now, true);
  assert.equal(room.state.includes('Alice'), true);

  const stored = getRoomRecord('AB12C');
  assert.ok(stored);
  assert.equal(stored.code, 'AB12C');
  assert.equal(stored.state.includes('Alice'), true);
});

test('saveRoomRecord updates version and keeps latest payload', () => {
  const now = Date.now();
  const record = createRoomRecord('DE34F', 'Bob', now);
  const room = JSON.parse(record.state);
  room.phase = 'result';

  const updated = saveRoomRecord('DE34F', room, record.version, now + 60_000);

  assert.equal(updated, true);
  const refreshed = getRoomRecord('DE34F');
  assert.ok(refreshed);
  assert.equal(refreshed.version, 1);
  assert.equal(JSON.parse(refreshed.state).phase, 'result');
});
