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

export async function getRoomRecordFromDb(code) {
  try {
    const { getDb } = await import("../db/index.ts");
    const { rooms: roomTable } = await import("../db/schema.ts");
    const { eq } = await import("drizzle-orm");
    const db = getDb();
    const rows = await db.select().from(roomTable).where(eq(roomTable.code, code)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return { code: row.code, state: row.state, version: row.version, expires: row.expires, token: row.token ?? "" };
  } catch {
    return null;
  }
}

export async function upsertRoomRecordToDb(code, room, version, expires, token) {
  try {
    const { getDb } = await import("../db/index.ts");
    const { rooms: roomTable } = await import("../db/schema.ts");
    const db = getDb();
    await db.insert(roomTable).values({ code, state: JSON.stringify(room), version, expires, token }).onConflictDoUpdate({
      target: roomTable.code,
      set: { state: JSON.stringify(room), version, expires, token },
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteRoomRecordFromDb(code, version) {
  try {
    const { getDb } = await import("../db/index.ts");
    const { rooms: roomTable } = await import("../db/schema.ts");
    const { eq } = await import("drizzle-orm");
    const db = getDb();
    const rows = await db.select().from(roomTable).where(eq(roomTable.code, code)).limit(1);
    const row = rows[0];
    if (!row || row.version !== version) return false;
    await db.delete(roomTable).where(eq(roomTable.code, code));
    return true;
  } catch {
    return false;
  }
}
