# Bản đồ mã nguồn

## Cập nhật Vercel → D1 (13/11/2026)

Các hash trong danh mục nền bên dưới là trước bản sửa storage; không dùng chúng như hash của workspace hiện tại. Các file mới và điểm vào chính của bản sửa:

| File | Vai trò |
| --- | --- |
| [lib/storage-context.mjs](../lib/storage-context.mjs) | Chọn store, chặn RAM production, context binding theo request |
| [lib/remote-room-store.mjs](../lib/remote-room-store.mjs) | Client HTTPS từ Vercel tới Worker |
| [worker/room-storage.mjs](../worker/room-storage.mjs) | Worker độc lập, xác thực secret, SQL kiểm soát version |
| [wrangler.jsonc](../wrangler.jsonc) | Cấu hình CLI deploy storage Worker và D1 |
| [.env.example](../.env.example) | Mẫu biến môi trường server-only |
| [db/bootstrap.sql](../db/bootstrap.sql) | Schema đầy đủ cho database mới qua dashboard |
| [scripts/check-room-storage.mjs](../scripts/check-room-storage.mjs) | Kiểm tra xác thực/binding/schema thật |
| [scripts/verify-room-api.mjs](../scripts/verify-room-api.mjs) | Smoke test API với 3 người |
| [tests/cloudflare-storage.test.mjs](../tests/cloudflare-storage.test.mjs) | Test storage/Worker/cạnh tranh/version/config/mã phòng |
| [KET_NOI_CLOUDFLARE_D1.md](KET_NOI_CLOUDFLARE_D1.md) | Hướng dẫn tạo và kết nối tài nguyên production |

File đã sửa: `app/api/rooms/route.ts`, `lib/room-store.mjs`, `lib/game.mjs`, `worker/index.ts`, `package.json`, `.gitignore`, README và đặc tả.

## Danh mục nền

Đối chiếu ngày 13/11/2026, commit 7b22962. Đọc [đặc tả](DAC_TA_DU_AN.md) trước khi sửa chức năng.

Danh mục file nguồn/cấu hình với số dòng và SHA-256 rút gọn để đối chiếu thay đổi. Không gồm node_modules, .git, .next, bản build và lockfile. Xem đặc tả để hiểu chức năng game; UI starter không đồng nghĩa tính năng đang dùng.

| File | Số dòng | SHA-256 (12 ký tự) | Vai trò |
| --- | ---: | --- | --- |
| [.gitignore](../.gitignore) | 46 | 5ca3c39bdc12 | Cấu hình hoặc thành phần hỗ trợ |
| [.npmrc](../.npmrc) | 4 | a3909ac0447c | Cấu hình hoặc thành phần hỗ trợ |
| [.nvmrc](../.nvmrc) | 2 | 0af42f119663 | Cấu hình hoặc thành phần hỗ trợ |
| [app/api/rooms/route.ts](../app/api/rooms/route.ts) | 111 | 5475366f55e7 | Nguồn chức năng; xem bảng tra cứu trong đặc tả |
| [app/chatgpt-auth.ts](../app/chatgpt-auth.ts) | 91 | 4265a2e7c2dc | Hạ tầng connector/auth starter |
| [app/globals.css](../app/globals.css) | 201 | 71a4ffeaa00a | Nguồn chức năng; xem bảng tra cứu trong đặc tả |
| [app/layout.tsx](../app/layout.tsx) | 13 | e16900cbf9ab | Nguồn chức năng; xem bảng tra cứu trong đặc tả |
| [app/page.tsx](../app/page.tsx) | 378 | 0e8c639f881d | Nguồn chức năng; xem bảng tra cứu trong đặc tả |
| [cloudflare-env.d.ts](../cloudflare-env.d.ts) | 7 | 8b0eca84aa33 | Cấu hình hoặc thành phần hỗ trợ |
| [components.json](../components.json) | 22 | 31f4ca67a4a6 | Cấu hình hoặc thành phần hỗ trợ |
| [components/connector-error.tsx](../components/connector-error.tsx) | 37 | 2d0d04559952 | Cấu hình hoặc thành phần hỗ trợ |
| [components/ui/accordion.tsx](../components/ui/accordion.tsx) | 67 | a4f153089ba8 | UI starter; trang game không import |
| [components/ui/alert-dialog.tsx](../components/ui/alert-dialog.tsx) | 197 | 9a8d950f2b9b | UI starter; trang game không import |
| [components/ui/alert.tsx](../components/ui/alert.tsx) | 67 | 2cc59b5f7bda | UI starter; trang game không import |
| [components/ui/aspect-ratio.tsx](../components/ui/aspect-ratio.tsx) | 12 | b1c157886236 | UI starter; trang game không import |
| [components/ui/attachment.tsx](../components/ui/attachment.tsx) | 205 | ae8a25dd1a89 | UI starter; trang game không import |
| [components/ui/avatar.tsx](../components/ui/avatar.tsx) | 110 | 58a846bf1617 | UI starter; trang game không import |
| [components/ui/badge.tsx](../components/ui/badge.tsx) | 49 | 46a0de5224f6 | UI starter; trang game không import |
| [components/ui/breadcrumb.tsx](../components/ui/breadcrumb.tsx) | 110 | d4c0831bba22 | UI starter; trang game không import |
| [components/ui/bubble.tsx](../components/ui/bubble.tsx) | 126 | 870cc0c5cfc8 | UI starter; trang game không import |
| [components/ui/button-group.tsx](../components/ui/button-group.tsx) | 84 | 784c89d8ee68 | UI starter; trang game không import |
| [components/ui/button.tsx](../components/ui/button.tsx) | 65 | cc36af0f8b50 | UI starter; trang game không import |
| [components/ui/calendar.tsx](../components/ui/calendar.tsx) | 221 | 3855fbe0d3f8 | UI starter; trang game không import |
| [components/ui/card.tsx](../components/ui/card.tsx) | 93 | c48dd3b96be9 | UI starter; trang game không import |
| [components/ui/carousel.tsx](../components/ui/carousel.tsx) | 242 | b7ea0dda3903 | UI starter; trang game không import |
| [components/ui/chart.tsx](../components/ui/chart.tsx) | 378 | 45aa5ea4a386 | UI starter; trang game không import |
| [components/ui/checkbox.tsx](../components/ui/checkbox.tsx) | 33 | b23ab9d4deee | UI starter; trang game không import |
| [components/ui/collapsible.tsx](../components/ui/collapsible.tsx) | 34 | c6598e5584f4 | UI starter; trang game không import |
| [components/ui/combobox.tsx](../components/ui/combobox.tsx) | 311 | 2d68e78b2dc7 | UI starter; trang game không import |
| [components/ui/command.tsx](../components/ui/command.tsx) | 185 | 361193df1e3d | UI starter; trang game không import |
| [components/ui/context-menu.tsx](../components/ui/context-menu.tsx) | 253 | 2cf1fcf59df0 | UI starter; trang game không import |
| [components/ui/dialog.tsx](../components/ui/dialog.tsx) | 159 | dce39c6adc47 | UI starter; trang game không import |
| [components/ui/direction.tsx](../components/ui/direction.tsx) | 23 | 84ae2ad65820 | UI starter; trang game không import |
| [components/ui/drawer.tsx](../components/ui/drawer.tsx) | 136 | cb6eaf58eb07 | UI starter; trang game không import |
| [components/ui/dropdown-menu.tsx](../components/ui/dropdown-menu.tsx) | 258 | 98f0dcdae382 | UI starter; trang game không import |
| [components/ui/empty.tsx](../components/ui/empty.tsx) | 105 | ae95bdcf367a | UI starter; trang game không import |
| [components/ui/field.tsx](../components/ui/field.tsx) | 249 | ba67d76f017a | UI starter; trang game không import |
| [components/ui/form.tsx](../components/ui/form.tsx) | 168 | 315b46bb75ab | UI starter; trang game không import |
| [components/ui/hover-card.tsx](../components/ui/hover-card.tsx) | 45 | f5d8df42c593 | UI starter; trang game không import |
| [components/ui/input-group.tsx](../components/ui/input-group.tsx) | 171 | 6afbd58fea4c | UI starter; trang game không import |
| [components/ui/input-otp.tsx](../components/ui/input-otp.tsx) | 78 | 161946daa89f | UI starter; trang game không import |
| [components/ui/input.tsx](../components/ui/input.tsx) | 22 | 8c4612a7c413 | UI starter; trang game không import |
| [components/ui/item.tsx](../components/ui/item.tsx) | 194 | 6e2144d6d871 | UI starter; trang game không import |
| [components/ui/kbd.tsx](../components/ui/kbd.tsx) | 29 | 6088c3a54323 | UI starter; trang game không import |
| [components/ui/label.tsx](../components/ui/label.tsx) | 25 | a476e41f08b9 | UI starter; trang game không import |
| [components/ui/marker.tsx](../components/ui/marker.tsx) | 70 | 3d798763f094 | UI starter; trang game không import |
| [components/ui/menubar.tsx](../components/ui/menubar.tsx) | 277 | 9243af8afcea | UI starter; trang game không import |
| [components/ui/message-scroller.tsx](../components/ui/message-scroller.tsx) | 131 | bb7660a248e4 | UI starter; trang game không import |
| [components/ui/message.tsx](../components/ui/message.tsx) | 93 | 9d2952bf3b64 | UI starter; trang game không import |
| [components/ui/native-select.tsx](../components/ui/native-select.tsx) | 63 | 007516b111fc | UI starter; trang game không import |
| [components/ui/navigation-menu.tsx](../components/ui/navigation-menu.tsx) | 169 | 889d358a77de | UI starter; trang game không import |
| [components/ui/pagination.tsx](../components/ui/pagination.tsx) | 128 | 374ad135c3d4 | UI starter; trang game không import |
| [components/ui/popover.tsx](../components/ui/popover.tsx) | 90 | 31c350309ff5 | UI starter; trang game không import |
| [components/ui/progress.tsx](../components/ui/progress.tsx) | 33 | c8c26e8f5f04 | UI starter; trang game không import |
| [components/ui/radio-group.tsx](../components/ui/radio-group.tsx) | 46 | fe5ce39636d0 | UI starter; trang game không import |
| [components/ui/resizable.tsx](../components/ui/resizable.tsx) | 54 | bc63958467aa | UI starter; trang game không import |
| [components/ui/scroll-area.tsx](../components/ui/scroll-area.tsx) | 59 | 8bd9d986b284 | UI starter; trang game không import |
| [components/ui/select.tsx](../components/ui/select.tsx) | 191 | 0b796a108a4e | UI starter; trang game không import |
| [components/ui/separator.tsx](../components/ui/separator.tsx) | 29 | 6da346505c86 | UI starter; trang game không import |
| [components/ui/sheet.tsx](../components/ui/sheet.tsx) | 144 | 63863cf2df8f | UI starter; trang game không import |
| [components/ui/sidebar.tsx](../components/ui/sidebar.tsx) | 724 | 4a8d73e7730a | UI starter; trang game không import |
| [components/ui/skeleton.tsx](../components/ui/skeleton.tsx) | 14 | ba48dd5be5a6 | UI starter; trang game không import |
| [components/ui/slider.tsx](../components/ui/slider.tsx) | 64 | 0e37484f4b41 | UI starter; trang game không import |
| [components/ui/sonner.tsx](../components/ui/sonner.tsx) | 41 | 13ccc9b0fe42 | UI starter; trang game không import |
| [components/ui/spinner.tsx](../components/ui/spinner.tsx) | 17 | 3e6e6e8d37fb | UI starter; trang game không import |
| [components/ui/switch.tsx](../components/ui/switch.tsx) | 36 | 386d4d4deb39 | UI starter; trang game không import |
| [components/ui/table.tsx](../components/ui/table.tsx) | 117 | 20e5a7f22495 | UI starter; trang game không import |
| [components/ui/tabs.tsx](../components/ui/tabs.tsx) | 92 | 865d0194331b | UI starter; trang game không import |
| [components/ui/textarea.tsx](../components/ui/textarea.tsx) | 19 | 253cdeb487c7 | UI starter; trang game không import |
| [components/ui/toggle-group.tsx](../components/ui/toggle-group.tsx) | 84 | 69f643e889e9 | UI starter; trang game không import |
| [components/ui/toggle.tsx](../components/ui/toggle.tsx) | 48 | ba4d0b0a2b2f | UI starter; trang game không import |
| [components/ui/tooltip.tsx](../components/ui/tooltip.tsx) | 58 | a0784eb77831 | UI starter; trang game không import |
| [db/index.ts](../db/index.ts) | 14 | dc7610b00b91 | Nguồn chức năng; xem bảng tra cứu trong đặc tả |
| [db/schema.ts](../db/schema.ts) | 10 | 1fb39c5b494d | Nguồn chức năng; xem bảng tra cứu trong đặc tả |
| [drizzle.config.ts](../drizzle.config.ts) | 8 | af081f7384aa | Cấu hình hoặc thành phần hỗ trợ |
| [drizzle/0000_room_storage.sql](../drizzle/0000_room_storage.sql) | 8 | 8969cfc29583 | Migration và metadata schema |
| [drizzle/0001_room_token.sql](../drizzle/0001_room_token.sql) | 2 | 79afaac1bfab | Migration và metadata schema |
| [drizzle/meta/0000_snapshot.json](../drizzle/meta/0000_snapshot.json) | 64 | 2d66a745ff56 | Migration và metadata schema |
| [drizzle/meta/_journal.json](../drizzle/meta/_journal.json) | 13 | 6d59c47da2ff | Migration và metadata schema |
| [eslint.config.mjs](../eslint.config.mjs) | 29 | eeda7faabe95 | Cấu hình hoặc thành phần hỗ trợ |
| [examples/d1/app/api/notes/route.ts](../examples/d1/app/api/notes/route.ts) | 59 | a3d4a74fd53b | Ví dụ D1; không phải route game |
| [examples/d1/db/schema.ts](../examples/d1/db/schema.ts) | 10 | d89eabd95716 | Ví dụ D1; không phải route game |
| [hooks/use-mobile.ts](../hooks/use-mobile.ts) | 20 | ad0936f84f1d | Cấu hình hoặc thành phần hỗ trợ |
| [lib/connector-context.ts](../lib/connector-context.ts) | 18 | bbddff68689c | Hạ tầng connector/auth starter |
| [lib/connector-contract.mts](../lib/connector-contract.mts) | 174 | e1a7b24a8793 | Hạ tầng connector/auth starter |
| [lib/connector-errors.mts](../lib/connector-errors.mts) | 84 | a22edf13d687 | Hạ tầng connector/auth starter |
| [lib/connector-preview.d.ts](../lib/connector-preview.d.ts) | 13 | abd69a94f7f6 | Hạ tầng connector/auth starter |
| [lib/connectors.ts](../lib/connectors.ts) | 14 | 1c93d747e384 | Hạ tầng connector/auth starter |
| [lib/game.mjs](../lib/game.mjs) | 256 | b11ac8911292 | Nguồn chức năng; xem bảng tra cứu trong đặc tả |
| [lib/room-store.mjs](../lib/room-store.mjs) | 126 | 5764c2fdc242 | Nguồn chức năng; xem bảng tra cứu trong đặc tả |
| [lib/utils.ts](../lib/utils.ts) | 7 | 53f3d3d070f0 | Cấu hình hoặc thành phần hỗ trợ |
| [lib/word-bank.mjs](../lib/word-bank.mjs) | 188 | b58ceb38ea8e | Nguồn chức năng; xem bảng tra cứu trong đặc tả |
| [next-env.d.ts](../next-env.d.ts) | 8 | 1b59d4c6b838 | Cấu hình hoặc thành phần hỗ trợ |
| [next.config.ts](../next.config.ts) | 6 | ab4c61f6ee10 | Cấu hình hoặc thành phần hỗ trợ |
| [package.json](../package.json) | 70 | ea47f6be8ef7 | Cấu hình hoặc thành phần hỗ trợ |
| [postcss.config.mjs](../postcss.config.mjs) | 8 | dfac7ac2d86d | Cấu hình hoặc thành phần hỗ trợ |
| [public/favicon.svg](../public/favicon.svg) | 2 | b6e1f3e6c5ce | Cấu hình hoặc thành phần hỗ trợ |
| [scripts/build-verified.sh](../scripts/build-verified.sh) | 27 | 2ae5329ac860 | Hạ tầng môi trường, preview và build |
| [scripts/connector-preview/connector-preview-session.mjs](../scripts/connector-preview/connector-preview-session.mjs) | 215 | 57224ad185a2 | Hạ tầng môi trường, preview và build |
| [scripts/connector-preview/host-binding.mjs](../scripts/connector-preview/host-binding.mjs) | 218 | 9e44ab686413 | Hạ tầng môi trường, preview và build |
| [scripts/connector-preview/protocol.mjs](../scripts/connector-preview/protocol.mjs) | 61 | 111e062ebf08 | Hạ tầng môi trường, preview và build |
| [scripts/connector-preview/worker.mjs](../scripts/connector-preview/worker.mjs) | 18 | bd9c98fc68f2 | Hạ tầng môi trường, preview và build |
| [scripts/execution-profile.mjs](../scripts/execution-profile.mjs) | 17 | 2e71116f4d2b | Hạ tầng môi trường, preview và build |
| [scripts/install-ci.mjs](../scripts/install-ci.mjs) | 50 | 4a5a92d60a08 | Hạ tầng môi trường, preview và build |
| [scripts/install-ci.sh](../scripts/install-ci.sh) | 194 | 10d8764a61be | Hạ tầng môi trường, preview và build |
| [scripts/install-pnpm.sh](../scripts/install-pnpm.sh) | 217 | a684c02c2b49 | Hạ tầng môi trường, preview và build |
| [scripts/npm-install.mjs](../scripts/npm-install.mjs) | 232 | 9715c6a32d1d | Hạ tầng môi trường, preview và build |
| [scripts/pnpm-install.mjs](../scripts/pnpm-install.mjs) | 262 | a83164e344c1 | Hạ tầng môi trường, preview và build |
| [scripts/run-framework.mjs](../scripts/run-framework.mjs) | 24 | 9bf9f41a2931 | Hạ tầng môi trường, preview và build |
| [scripts/sites-env.mjs](../scripts/sites-env.mjs) | 17 | 21d7bde6acb9 | Hạ tầng môi trường, preview và build |
| [scripts/sites-env.sh](../scripts/sites-env.sh) | 54 | d18af7b222db | Hạ tầng môi trường, preview và build |
| [scripts/tool-environment.mjs](../scripts/tool-environment.mjs) | 20 | 6da99286e0eb | Hạ tầng môi trường, preview và build |
| [scripts/vite/connector-preview-plugin.mjs](../scripts/vite/connector-preview-plugin.mjs) | 199 | a6a9fe2086e3 | Hạ tầng môi trường, preview và build |
| [scripts/vite/sites-vite-plugin.LICENSE](../scripts/vite/sites-vite-plugin.LICENSE) | 22 | 7de1e115d165 | Hạ tầng môi trường, preview và build |
| [scripts/vite/sites-vite-plugin.ts](../scripts/vite/sites-vite-plugin.ts) | 231 | 07af20e7097d | Hạ tầng môi trường, preview và build |
| [tsconfig.json](../tsconfig.json) | 54 | a4c1cc83b63e | Cấu hình hoặc thành phần hỗ trợ |
| [vendor/shadcn-tailwind-4.13.0.LICENSE.md](../vendor/shadcn-tailwind-4.13.0.LICENSE.md) | 22 | 1564074e1343 | Cấu hình hoặc thành phần hỗ trợ |
| [vendor/shadcn-tailwind-4.13.0.css](../vendor/shadcn-tailwind-4.13.0.css) | 630 | bc7d83425702 | Cấu hình hoặc thành phần hỗ trợ |
| [vercel.json](../vercel.json) | 6 | 593744530e05 | Cấu hình hoặc thành phần hỗ trợ |
| [vite.config.ts](../vite.config.ts) | 93 | 22ff558b1636 | Cấu hình hoặc thành phần hỗ trợ |
| [worker/index.ts](../worker/index.ts) | 31 | a0a10229cdda | Entrypoint Worker/Vinext |
| [tests/room-store.test.mjs](../tests/room-store.test.mjs) | 56 | 8bc9a1fc59a4 | Cấu hình hoặc thành phần hỗ trợ |
