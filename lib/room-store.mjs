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

export function listRoomRecords(now = Date.now()) {
  pruneExpiredRoomRecords(now);
  return [...rooms.entries()].map(([code, record]) => {
    const room = parseRecordState(record.state);
    if (!room || !isRoomActive(room)) return null;

    const host = room.host && room.players.some(player => player.id === room.host) ? room.host : room.players[0]?.id ?? null;
    const hostPlayer = room.players.find(player => player.id === host) ?? room.players[0] ?? null;
    return {
      code,
      phase: room.phase,
      status: ["clue", "vote", "rescue"].includes(room.phase) ? "playing" : "waiting",
      locked: Boolean(room.lock),
      lockCode: room.lock && ["lobby", "result"].includes(room.phase) ? room.lock : "",
      playerCount: room.players.length,
      slots: Math.max(0, 5 - room.players.length),
      host: host,
      hostName: hostPlayer?.name ?? "Chưa có",
      maxPlayers: 5,
    };
  }).filter(Boolean);
}

export const memoryRoomStore = {
  read: getRoomRecord,
  list: listRoomRecords,
  create(record) {
    pruneExpiredRoomRecords();
    if (rooms.has(record.code)) return false;
    rooms.set(record.code, { ...record });
    return true;
  },
  save: saveRoomRecord,
  remove: deleteRoomRecord,
};
