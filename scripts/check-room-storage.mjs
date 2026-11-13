import { createRemoteRoomStore } from "../lib/remote-room-store.mjs";

try {
  const store = createRemoteRoomStore(process.env.ROOM_STORAGE_URL?.trim(), process.env.ROOM_STORAGE_SECRET?.trim());
  const result = await store.health();
  if (result?.storage !== "cloudflare-d1" || result?.schema !== "rooms-v1") throw new Error("Unexpected storage response.");
  console.log("OK: Cloudflare Worker authentication, D1 binding and rooms schema are ready.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
