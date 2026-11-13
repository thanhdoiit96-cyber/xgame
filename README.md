# Ai Lạc Quẻ?

Game trình duyệt tiếng Việt cho 3–5 người. Tạo phòng, mời bạn bằng link hoặc mã 5 ký tự, gửi hai lượt gợi ý và tìm người nhận từ khác.

## Tài liệu

- [Đặc tả kiến trúc, UI và gameplay](docs/DAC_TA_DU_AN.md)
- [Bản đồ mã nguồn](docs/BAN_DO_MA_NGUON.md)
- **[Hướng dẫn tạo và kết nối Cloudflare D1 với Vercel](docs/KET_NOI_CLOUDFLARE_D1.md)**

## Chạy local

Yêu cầu Node.js >=22.13.0.

```sh
npm ci
npm run dev
```

Dev chưa cấu hình storage dùng RAM trong một tiến trình. Muốn dùng D1, copy `.env.example` thành `.env.local` và điền `ROOM_STORAGE_URL`, `ROOM_STORAGE_SECRET` của Worker lưu trữ.

```sh
npm run db:check
npm test
npm run build
npm start
```

`npm start` chạy production nên yêu cầu storage bền vững, không dùng RAM fallback.

## Deploy Vercel + Cloudflare D1

Website và `/api/rooms` chạy Next.js trên Vercel. API gọi Worker `worker/room-storage.mjs` qua HTTPS; Worker lưu bảng `rooms` trong D1 bằng binding `DB`.

1. Tạo D1 database `xgame-db` và chạy `db/bootstrap.sql` cho database mới.
2. Tạo Worker từ `worker/room-storage.mjs`, gắn database bằng binding tên `DB`.
3. Đặt secret `ROOM_STORAGE_SECRET` (ít nhất 32 ký tự ngẫu nhiên) trên Worker.
4. Trên Vercel đặt `ROOM_STORAGE_URL` là URL Worker và `ROOM_STORAGE_SECRET` giống Worker; không dùng tiền tố `NEXT_PUBLIC_`.
5. Deploy code mới sau khi thêm biến môi trường. Các bước dashboard, CLI và chẩn đoán nằm trong hướng dẫn liên kết ở trên.

Không cần API token quản trị Cloudflare trong Vercel hoặc đổi DNS. `.openai/hosting.json` không tạo binding D1 cho Vercel. File `wrangler.jsonc` dành cho triển khai Worker lưu trữ qua CLI; thay placeholder Database ID trước khi dùng.

Nếu deploy Worker qua Git trên Cloudflare: đặt **Build command = `npm run storage:build`**, **Deploy command = `npm run storage:deploy`**. Config hiện dùng tên Worker `xgame`; tên này phải khớp dashboard. File mặc định `wrangler.jsonc` cũng giúp lệnh `npx wrangler deploy` nhận đúng Worker lưu trữ, không kích hoạt OpenNext. Xem mục 6.1 trong hướng dẫn để xử lý log ERESOLVE.

Storage lỗi trả 503, không âm thầm tạo phòng RAM. D1 dùng điều kiện version nguyên tử để tránh mất cập nhật đồng thời; mã trùng không ghi đè phòng hiện có.

## Luật chơi

1. Cả nhóm nhận cùng một từ, riêng một người nhận từ gần giống. Mỗi người chỉ thấy từ của mình.
2. Lượt gợi ý đầu có 45 giây, tối đa 3 từ; lượt sau có 40 giây, tối đa 12 từ. Gợi ý cùng lượt được mở khi đủ người gửi hoặc hết giờ.
3. Bỏ phiếu trong 35 giây. Người lạc quẻ chỉ bị bắt khi đứng đầu phiếu một mình; khi đó có 20 giây và một lần đoán từ của nhóm để lật kèo.
4. Khi nhóm thắng, mỗi người bỏ phiếu đúng được 2 điểm. Người lạc quẻ được 3 điểm nếu thoát hoặc đoán đúng. Hòa đầu phiếu thì lạc quẻ thoát; không có phiếu thì không tính điểm.

Bộ từ trong `lib/word-bank.mjs` gồm 4.032 cặp: 2.304 Tiêu chuẩn và 1.728 Đấu trí. Điểm cộng dồn trong phòng. Metadata TTL là 24 giờ nhưng code giữ phòng còn active vượt hạn; chưa có tự động rời khi đóng tab. Người cuối chủ động rời thì phòng bị xóa.

## Kiểm tra API

```sh
node scripts/verify-room-api.mjs http://localhost:3000
```

Có thể thay URL bằng deployment của bạn. Script tạo phòng kiểm thử, chơi với 3 người qua API rồi tự rời phòng; không in token. Test storage dùng SQLite cục bộ mô phỏng D1 binding, không thay thế kiểm tra kết nối Cloudflare thật.
