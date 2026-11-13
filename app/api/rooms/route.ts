import { act, advance, identify, roomCode, roomTtl, snapshot } from "../../../lib/game.mjs";
import { createRoomRecord, deleteRoomRecord, getRoomRecord, isRoomActive, pruneExpiredRoomRecords, saveRoomRecord } from "../../../lib/room-store.mjs";

export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function run(request: Request, body: Record<string, unknown> = {}) {
  const action = request.method === "GET" ? "status" : body.action;

  if (action === "create") {
    const now = Date.now();
    pruneExpiredRoomRecords(now);
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = roomCode();
      const record = createRoomRecord(code, String(body.name ?? ""), now);
      const room = JSON.parse(record.state);
      return json({ token: record.token, room: snapshot(room, identify(room, record.token), now) }, 201);
    }
    return json({ error: "Chưa tạo được mã phòng. Hãy thử lại." }, 503);
  }

  const url = new URL(request.url);
  const code = String(url.searchParams.get("code") ?? body.code ?? "").trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{5}$/.test(code)) return json({ error: "Mã phòng phải có 5 ký tự hợp lệ." }, 400);
  const token = request.headers.get("Authorization")?.slice(7) ?? "";

  for (let attempt = 0; attempt < 8; attempt++) {
    const now = Date.now();
    const row = getRoomRecord(code);
    if (!row) return json({ error: "Phòng không tồn tại hoặc đã hết hạn." }, 404);

    const room = JSON.parse(row.state);
    if (row.expires <= now && !isRoomActive(room)) return json({ error: "Phòng không tồn tại hoặc đã hết hạn." }, 404);

    const changed = advance(room, now);
    if (action === "status") {
      const player = identify(room, token);
      if (changed && !saveRoomRecord(code, room, row.version, row.expires)) continue;
      return json({ room: snapshot(room, player, now) });
    }

    const result = act(room, action, body, token, now);
    advance(room, now);

    if (result.left && !room.players.length) {
      if (!deleteRoomRecord(code, row.version)) continue;
    } else if (!saveRoomRecord(code, room, row.version, now + roomTtl)) {
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
