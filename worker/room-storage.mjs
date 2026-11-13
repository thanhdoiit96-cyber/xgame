// Standalone module: can also be pasted into Cloudflare's Worker editor.
export function createD1RoomStore(database) {
  // Always read from the primary when read replication is enabled.
  const db = database.withSession ? database.withSession("first-primary") : database;
  return {
    async read(code) {
      return db.prepare("SELECT code, state, version, expires, token FROM rooms WHERE code = ?").bind(code).first();
    },
    async create(record) {
      const result = await db.prepare(
        "INSERT INTO rooms (code, state, version, expires, token) VALUES (?, ?, ?, ?, ?) ON CONFLICT(code) DO NOTHING"
      ).bind(record.code, record.state, record.version, record.expires, record.token).run();
      return result.meta.changes === 1;
    },
    async save(code, room, version, expires) {
      const result = await db.prepare(
        "UPDATE rooms SET state = ?, version = version + 1, expires = ? WHERE code = ? AND version = ?"
      ).bind(JSON.stringify(room), expires, code, version).run();
      return result.meta.changes === 1;
    },
    async remove(code, version) {
      const result = await db.prepare("DELETE FROM rooms WHERE code = ? AND version = ?").bind(code, version).run();
      return result.meta.changes === 1;
    },
    async health() {
      // Check the actual schema, including the token migration, without returning data.
      await db.prepare("SELECT code, state, version, expires, token FROM rooms LIMIT 0").all();
      return { storage: "cloudflare-d1", schema: "rooms-v1" };
    },
  };
}

const json = (body, status = 200) => Response.json(body, {
  status, headers: { "Cache-Control": "no-store" },
});
const validVersion = value => Number.isSafeInteger(value) && value >= 0;

const worker = {
  async fetch(request, env) {
    if (!env.DB || typeof env.ROOM_STORAGE_SECRET !== "string" || env.ROOM_STORAGE_SECRET.length < 32) {
      return json({ error: "Storage binding or secret is not configured." }, 503);
    }
    if (request.headers.get("Authorization") !== `Bearer ${env.ROOM_STORAGE_SECRET}`) {
      return json({ error: "Unauthorized" }, 401);
    }
    if (request.method !== "POST") return json({ error: "Use POST" }, 405);
    try {
      const raw = await request.text();
      if (raw.length > 1_000_000) return json({ error: "Payload too large" }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return json({ error: "Invalid JSON" }, 400); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid payload" }, 400);
      const store = createD1RoomStore(env.DB);
      if (body.operation === "health") return json({ result: await store.health() });
      const code = body.operation === "create" ? body.record?.code : body.code;
      if (typeof code !== "string" || !/^[A-HJ-NP-Z2-9]{5}$/.test(code)) return json({ error: "Invalid code" }, 400);
      switch (body.operation) {
        case "read": return json({ result: await store.read(code) });
        case "create": {
          const r = body.record;
          if (typeof r.state !== "string" || typeof r.token !== "string" || r.version !== 0 || !validVersion(r.expires)) break;
          return json({ result: await store.create(r) });
        }
        case "save":
          if (!body.room || typeof body.room !== "object" || Array.isArray(body.room) || !validVersion(body.version) || !validVersion(body.expires)) break;
          return json({ result: await store.save(code, body.room, body.version, body.expires) });
        case "remove":
          if (!validVersion(body.version)) break;
          return json({ result: await store.remove(code, body.version) });
      }
      return json({ error: "Invalid operation or parameters" }, 400);
    } catch {
      // Never return SQL, room state, player tokens or credentials in an error.
      console.error("room-storage: D1 operation failed; check binding and migrations.");
      return json({ error: "D1 operation failed. Check DB binding and rooms migrations." }, 503);
    }
  },
};

export default worker;
