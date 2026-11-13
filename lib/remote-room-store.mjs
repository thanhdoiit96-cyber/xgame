function unavailable(message) {
  return Object.assign(new Error(message), { status: 503 });
}

export function createRemoteRoomStore(url, secret, fetcher = fetch) {
  let endpoint;
  try { endpoint = new URL(url); } catch { throw unavailable("ROOM_STORAGE_URL chưa hợp lệ."); }
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw unavailable("ROOM_STORAGE_URL phải là URL HTTPS của Worker, không chứa thông tin đăng nhập hoặc query.");
  }
  if (!secret || secret.length < 32) throw unavailable("ROOM_STORAGE_SECRET cần ít nhất 32 ký tự và phải khớp với Worker.");

  async function call(body) {
    let response;
    try {
      response = await fetcher(endpoint.href, {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify(body), cache: "no-store", redirect: "error",
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      // A timed-out write may already have completed. Do not replay it automatically.
      throw unavailable("Không kết nối được bộ lưu phòng Cloudflare. Hãy thử tải lại phòng.");
    }
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw unavailable("Kết nối Cloudflare bị từ chối. Kiểm tra ROOM_STORAGE_SECRET trên Vercel và Worker.");
      throw unavailable("Bộ lưu phòng Cloudflare chưa sẵn sàng. Kiểm tra Worker, binding DB và bảng rooms.");
    }
    let data;
    try { data = await response.json(); } catch { throw unavailable("Worker lưu phòng trả về dữ liệu không hợp lệ."); }
    if (!data || !Object.hasOwn(data, "result")) throw unavailable("Worker lưu phòng trả về dữ liệu không hợp lệ.");
    if (["create", "save", "remove"].includes(body.operation) && typeof data.result !== "boolean") {
      throw unavailable("Worker lưu phòng trả về kết quả ghi không hợp lệ.");
    }
    return data.result;
  }
  return {
    read: code => call({ operation: "read", code }),
    create: record => call({ operation: "create", record }),
    save: (code, room, version, expires) => call({ operation: "save", code, room, version, expires }),
    remove: (code, version) => call({ operation: "remove", code, version }),
    health: () => call({ operation: "health" }),
  };
}
