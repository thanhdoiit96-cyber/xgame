import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker, { createD1RoomStore } from "../worker/room-storage.mjs";
import { createRemoteRoomStore } from "../lib/remote-room-store.mjs";
import { getRoomStore, runWithRoomStore } from "../lib/storage-context.mjs";
import { createRoom, roomCode, roomTtl } from "../lib/game.mjs";

const secret = "test-secret-only-not-for-production-123456789";
function fixture(t) {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  sqlite.exec(readFileSync(new URL("../db/bootstrap.sql", import.meta.url), "utf8"));
  const DB = {
    prepare(sql) {
      let params = [];
      const statement = {
        bind(...values) { params = values; return statement; },
        async first() { return sqlite.prepare(sql).get(...params) ?? null; },
        async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...params).changes) } }; },
        async all() { return { results: sqlite.prepare(sql).all(...params) }; },
      };
      return statement;
    },
  };
  const env = { DB, ROOM_STORAGE_SECRET: secret };
  const fetcher = (url, init) => worker.fetch(new Request(url, init), env);
  const client = () => createRemoteRoomStore("https://test-storage.workers.dev", secret, fetcher);
  return { sqlite, DB, env, client };
}
function record(code = "ABCDE") {
  const { room, token } = createRoom(code, "Host");
  return { code, state: JSON.stringify(room), version: 0, expires: Date.now() + roomTtl, token };
}

test("separate Vercel clients read the same persisted room; code collision does not overwrite", async t => {
  const { client } = fixture(t);
  const original = record();
  assert.equal(await client().create(original), true);
  assert.deepEqual(await client().read(original.code), original);
  assert.equal(await client().create({ ...record(), token: "replacement" }), false);
  assert.deepEqual(await client().read(original.code), original);
});

test("concurrent saves preserve version and reject stale writes/deletes", async t => {
  const { client } = fixture(t);
  const a = client(), b = client(), r = record();
  await a.create(r);
  const first = JSON.parse(r.state), second = JSON.parse(r.state);
  first.round = 1;
  second.round = 2;
  const saved = await Promise.all([a.save(r.code, first, 0, r.expires), b.save(r.code, second, 0, r.expires)]);
  assert.equal(saved.filter(Boolean).length, 1);
  const latest = await b.read(r.code);
  assert.equal(latest.version, 1);
  assert.equal(JSON.parse(latest.state).round, saved[0] ? 1 : 2);
  assert.equal(await a.remove(r.code, 0), false);
  assert.equal(await b.remove(r.code, 1), true);
  assert.equal(await a.read(r.code), null);
  assert.equal(await a.save(r.code, first, 1, r.expires), false);
});

test("Worker authentication blocks room reads and arbitrary SQL", async t => {
  const { env, client } = fixture(t);
  await client().create(record());
  const denied = await worker.fetch(new Request("https://test/", {
    method: "POST", body: JSON.stringify({ operation: "read", code: "ABCDE" }),
  }), env);
  assert.equal(denied.status, 401);
  assert.equal((await denied.text()).includes("Host"), false);
  const arbitrary = await worker.fetch(new Request("https://test/", {
    method: "POST", headers: { Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ operation: "query", code: "ABCDE", sql: "DELETE FROM rooms" }),
  }), env);
  assert.equal(arbitrary.status, 400);
  assert.ok(await client().read("ABCDE"));
});

test("schema failure is 503, not a missing room or successful memory fallback", async t => {
  const { sqlite, client } = fixture(t);
  assert.equal((await client().health()).schema, "rooms-v1");
  sqlite.exec("DROP TABLE rooms");
  await assert.rejects(client().read("ABCDE"), error => error.status === 503);
  await assert.rejects(client().create(record()), error => error.status === 503);
});

test("production requires durable configuration; incomplete development config also fails", () => {
  assert.throws(() => getRoomStore({ NODE_ENV: "production" }), error => error.status === 503);
  assert.throws(() => getRoomStore({ VERCEL: "1", NODE_ENV: "development" }), error => error.status === 503);
  assert.throws(() => getRoomStore({ ROOM_STORAGE_URL: "https://test/" }), error => error.status === 503);
  assert.ok(getRoomStore({ NODE_ENV: "development" }));
});

test("Worker native binding stays isolated per request", async t => {
  const { DB } = fixture(t);
  const store = createD1RoomStore(DB);
  await runWithRoomStore(store, async () => {
    await Promise.resolve();
    assert.equal(getRoomStore({ NODE_ENV: "production" }), store);
  });
  assert.throws(() => getRoomStore({ NODE_ENV: "production" }));
});

test("remote transport never replays ambiguous failures or leaks credential/body", async () => {
  let calls = 0;
  const store = createRemoteRoomStore("https://test/", secret, async (_url, init) => {
    calls++;
    assert.equal(init.redirect, "error");
    assert.equal(init.cache, "no-store");
    throw new Error(secret);
  });
  await assert.rejects(store.create(record()), error => error.status === 503 && !error.message.includes(secret));
  assert.equal(calls, 1);
  assert.throws(() => createRemoteRoomStore("http://test/", secret));
  assert.throws(() => createRemoteRoomStore("https://test/?token=secret", secret));
});

test("remote transport rejects auth errors and malformed successful replies", async () => {
  for (const response of [new Response("Denied", { status: 401 }), Response.json({}), Response.json({ result: "yes" })]) {
    const store = createRemoteRoomStore("https://test/", secret, async () => response);
    await assert.rejects(store.create(record()), error => error.status === 503);
  }
});

test("generated room codes always match API validation", () => {
  for (let i = 0; i < 10_000; i++) assert.match(roomCode(), /^[A-HJ-NP-Z2-9]{5}$/);
});
