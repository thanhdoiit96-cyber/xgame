import { env } from "cloudflare:workers";
import { act, advance, createRoom, identify, roomCode, roomTtl, snapshot } from "../../../lib/game.mjs";

export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const database = () => (env as unknown as { DB: D1Database }).DB;

async function run(request: Request, body: Record<string, unknown> = {}) {
  const db = database();
  const action = request.method === "GET" ? "status" : body.action;

  if (action === "create") {
    const now = Date.now();
    await db.prepare("DELETE FROM rooms WHERE expires <= ?").bind(now).run();
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = roomCode();
      const { room, token } = createRoom(code, body.name);
      const inserted = await db.prepare("INSERT OR IGNORE INTO rooms VALUES (?, ?, 0, ?)")
        .bind(code, JSON.stringify(room), now + roomTtl).run();
      if (inserted.meta.changes) return json({ token, room: snapshot(room, identify(room, token), now) }, 201);
    }
    return json({ error: "Chưa tạo được mã phòng. Hãy thử lại." }, 503);
  }

  const url = new URL(request.url);
  const code = String(url.searchParams.get("code") ?? body.code ?? "").trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{5}$/.test(code)) return json({ error: "Mã phòng phải có 5 ký tự hợp lệ." }, 400);
  const token = request.headers.get("Authorization")?.slice(7) ?? "";
  // Retry when two players submit against the same room version.
  for (let attempt = 0; attempt < 8; attempt++) {
    const now = Date.now();
    const row = await db.prepare("SELECT state, version, expires FROM rooms WHERE code = ? AND expires > ?")
      .bind(code, now).first<{ state: string; version: number; expires: number }>();
    if (!row) return json({ error: "Phòng không tồn tại hoặc đã hết hạn." }, 404);
    const room = JSON.parse(row.state);
    const changed = advance(room, now);
    if (action === "status") {
      const player = identify(room, token);
      if (changed && !await save(db, code, room, row.version, row.expires)) continue;
      return json({ room: snapshot(room, player, now) });
    }
    const result = act(room, action, body, token, now);
    advance(room, now);
    if (result.left && !room.players.length) {
      const deleted = await db.prepare("DELETE FROM rooms WHERE code = ? AND version = ?").bind(code, row.version).run();
      if (!deleted.meta.changes) continue;
    } else if (!await save(db, code, room, row.version, now + roomTtl)) {
      continue;
    }
    if (result.left) return json({ left: true });
    return json({
      room: snapshot(room, result.player, now),
      ...(action === "join" ? { token: result.player.token } : {}),
    });
  }
  return json({ error: "Phòng đang cập nhật. Hãy thử lại." }, 503);
}

async function save(db: D1Database, code: string, room: unknown, version: number, expires: number) {
  const result = await db.prepare("UPDATE rooms SET state = ?, version = version + 1, expires = ? WHERE code = ? AND version = ?")
    .bind(JSON.stringify(room), expires, code, version).run();
  return Boolean(result.meta.changes);
}

async function respond(request: Request) {
  try {
    if (request.method === "GET") return await run(request);
    const raw = await request.text();
    if (raw.length > 2048) return json({ error: "Nội dung gửi lên quá dài." }, 413);
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Dữ liệu không hợp lệ." }, 400);
    return await run(request, body);
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "Dữ liệu không hợp lệ." }, 400);
    const failure = error as Error & { status?: number };
    if (failure.status) return json({ error: failure.message }, failure.status);
    console.error(error);
    return json({ error: "Kết nối đến phòng gặp sự cố. Hãy thử lại." }, 503);
  }
}

export const GET = respond;
export const POST = respond;
