import { AsyncLocalStorage } from "node:async_hooks";
import { createRemoteRoomStore } from "./remote-room-store.mjs";
import { memoryRoomStore } from "./room-store.mjs";

const stores = new AsyncLocalStorage();

export function runWithRoomStore(store, callback) {
  return stores.run(store, callback);
}

export function getRoomStore(env = process.env) {
  const bound = stores.getStore();
  if (bound) return bound;
  const url = env.ROOM_STORAGE_URL?.trim();
  const secret = env.ROOM_STORAGE_SECRET?.trim();
  if (url || secret) return createRemoteRoomStore(url, secret);
  // Never report a successful ephemeral room on a serverless deployment.
  if (env.VERCEL || env.NODE_ENV === "production") {
    throw Object.assign(new Error("Chưa cấu hình lưu phòng Cloudflare. Cần ROOM_STORAGE_URL và ROOM_STORAGE_SECRET trên Vercel rồi redeploy."), { status: 503 });
  }
  return memoryRoomStore;
}
