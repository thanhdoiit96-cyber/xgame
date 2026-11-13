import { createRoom, roomTtl } from "./game.mjs";

const rooms = new Map();

export function pruneExpiredRoomRecords(now = Date.now()) {
  for (const [code, record] of rooms.entries()) {
    if (record.expires <= now) rooms.delete(code);
  }
}

export function getRoomRecord(code) {
  pruneExpiredRoomRecords();
  const record = rooms.get(code);
  if (!record) return null;
  if (record.expires <= Date.now()) {
    rooms.delete(code);
    return null;
  }
  return record;
}

export function createRoomRecord(code, name, now = Date.now()) {
  const { room, token } = createRoom(code, name);
  const record = {
    code,
    state: JSON.stringify(room),
    version: 0,
    expires: now + roomTtl,
    token,
  };

  rooms.set(code, record);
  return record;
}

export function saveRoomRecord(code, room, version, expires) {
  const current = rooms.get(code);
  if (!current || current.version !== version) return false;

  rooms.set(code, {
    ...current,
    state: JSON.stringify(room),
    version: version + 1,
    expires,
  });

  return true;
}

export function deleteRoomRecord(code, version) {
  const current = rooms.get(code);
  if (!current || current.version !== version) return false;

  rooms.delete(code);
  return true;
}

export function listRoomRecords() {
  return [...rooms.values()];
}
