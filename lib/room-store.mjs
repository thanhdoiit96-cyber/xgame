import { createRoom, roomTtl } from "./game.mjs";

const rooms = new Map();

function parseRecordState(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isRoomActive(recordState) {
  if (!recordState || typeof recordState !== "object") return false;
  const hasPlayers = Array.isArray(recordState.players) && recordState.players.length > 0;
  if (hasPlayers) return true;
  return ["lobby", "clue", "vote", "rescue", "result"].includes(recordState.phase);
}

export function pruneExpiredRoomRecords(now = Date.now()) {
  for (const [code, record] of rooms.entries()) {
    const room = parseRecordState(record.state);
    if (record.expires <= now && !isRoomActive(room)) rooms.delete(code);
  }
}

export function getRoomRecord(code) {
  pruneExpiredRoomRecords();
  const record = rooms.get(code);
  if (!record) return null;

  const room = parseRecordState(record.state);
  if (record.expires <= Date.now() && !isRoomActive(room)) {
    rooms.delete(code);
    return null;
  }

  return record;
}

export function createRoomRecord(code, name, now = Date.now()) {
  if (rooms.has(code)) return null;
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

export const memoryRoomStore = {
  read: getRoomRecord,
  create(record) {
    pruneExpiredRoomRecords();
    if (rooms.has(record.code)) return false;
    rooms.set(record.code, { ...record });
    return true;
  },
  save: saveRoomRecord,
  remove: deleteRoomRecord,
};
