import assert from "node:assert/strict";

const base = new URL(process.argv[2] ?? "http://localhost:3000");
const sessions = [];
async function request(action, session, fields = {}) {
  const url = new URL("/api/rooms", base);
  if (!action) url.searchParams.set("code", session.code);
  const response = await fetch(url, {
    method: action ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...(session && { Authorization: `Bearer ${session.token}` }) },
    body: action ? JSON.stringify({ action, code: session?.code, ...fields }) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`API ${response.status}: ${data.error}`);
  return data;
}
try {
  const created = await request("create", undefined, { name: "Storage test host" });
  const host = { code: created.room.code, token: created.token };
  sessions.push(host);
  assert.match(host.code, /^[A-HJ-NP-Z2-9]{5}$/);
  for (let i = 0; i < 3; i++) assert.equal((await request(null, host)).room.code, host.code);
  const joined = await Promise.all(["Storage test B", "Storage test C"].map(async name => {
    const reply = await request("join", undefined, { code: host.code, name });
    const session = { code: host.code, token: reply.token };
    sessions.push(session);
    return session;
  }));
  const all = [host, ...joined];
  const started = await request("start", host);
  const round = started.room.round;
  assert.equal(started.room.players.length, 3);
  for (const stage of [1, 2]) {
    await Promise.all(all.map((session, index) => request("clue", session, {
      round, stage, clue: `test${stage}nguoi${index}`,
    })));
  }
  const states = await Promise.all(all.map(async session => (await request(null, session)).room));
  assert.ok(states.every(room => room.phase === "vote"));
  assert.ok(states.every(room => !room.odd && !room.words && room.players.every(player => !player.token)));
  // Circular voting produces a tie: no rescue delay required.
  await Promise.all(all.map((session, index) => request("vote", session, { round, target: states[(index + 1) % 3].self })));
  const result = (await request(null, host)).room;
  assert.equal(result.phase, "result");
  assert.equal(result.result.tied, true);
  assert.equal(result.players.reduce((total, player) => total + player.score, 0), 3);
  console.log("PASS: create, repeated reads, concurrent joins/clues/votes, privacy and scoring.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  for (const session of sessions.reverse()) {
    try { await request("leave", session); } catch { console.error("Test room cleanup could not be confirmed."); }
  }
}
