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

test('idle rooms stay alive for a full day before expiring', () => {
  const now = Date.now();
  const record = createRoomRecord('GH56I', 'Carol', now);

  const ttlMs = record.expires - now;
  assert.ok(ttlMs >= 24 * 60 * 60 * 1000, 'Room TTL should be at least 24 hours for idle rooms');
});

test('rooms with players stay available after expiry while waiting or playing', () => {
  const now = Date.now();
  const record = createRoomRecord('KL12M', 'Dana', now);
  const room = JSON.parse(record.state);

  const updated = saveRoomRecord('KL12M', room, record.version, now - 1_000);
  assert.equal(updated, true);

  const refreshed = getRoomRecord('KL12M');
  assert.ok(refreshed);
  assert.equal(JSON.parse(refreshed.state).players.length, 1);
});
