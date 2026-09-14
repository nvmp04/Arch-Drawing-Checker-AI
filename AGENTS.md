<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Arch Drawing Checker AI

Hệ thống hỗ trợ soát bản vẽ kiến trúc bằng VLM + OCR + document parsing. Đồ án tốt nghiệp, 2 người, 6 tháng, 2 giai đoạn: nghiên cứu/đánh giá rồi xây dựng hệ thống (giai đoạn 2 giữ ở mức proof-of-concept).

**Phạm vi đã chốt — không mở rộng khi chưa hỏi:**

- Một loại công trình: nhà ở biệt thự / nhà dân (`HouseType` có 3 giá trị nhưng chỉ `villa` nằm trong phạm vi)
- Ba nhóm lý do: `compliance`, `geometry`, `documentation`

## Stack

Next.js 16.3.5 (App Router) · React 19.2.8 · TypeScript strict · Tailwind v4 (`@tailwindcss/postcss`, không có tailwind.config) · alias `@/*` → repo root, không có `src/`

## File ngữ cảnh — đọc trước khi viết UI

| File | Nội dung |
|---|---|
| `context/design-system.md` | Token, thang màu, verdict/status/group, typography, spacing, shadow, a11y |
| `context/ui-conventions.md` | App shell, điều hướng, màn hình, cấu trúc thư mục, đặt tên, theme |
| `context/component-recipes.md` | Code mẫu Button, Badge, FindingRow, DataTable, canvas, overlay |
| `app/globals.css` | **Nguồn sự thật** về giá trị token |
| `shared/constants/enums.ts` | **Nguồn sự thật** về enum miền |

Thứ tự đọc khi làm task UI: `design-system.md` → `ui-conventions.md` → `component-recipes.md`.

## Nguyên tắc bất di bất dịch

1. **Không hard-code màu.** Mọi màu đi qua token semantic (`bg-surface-raised`, `text-text-muted`, `bg-fail-subtle`). Không dùng palette mặc định của Tailwind (`bg-white`, `border-zinc-200`, `text-gray-500`).
2. **Không viết `dark:` cho màu.** Token tự đổi theo theme. Mặc định là dark.
3. **Verdict và FindingStatus là hai trục độc lập.** Máy kết luận gì (pass/fail/warn/na) khác với người xử lý tới đâu (open/resolved/dismissed) — không gộp thành một badge.
4. **`warn` là verdict hạng nhất.** Kết quả dưới ngưỡng tin cậy là `warn`, không ép thành `fail`.
5. **Luôn hiển thị confidence và tham chiếu trang** cạnh mọi kết luận tự động.
6. **Trạng thái không bao giờ chỉ bằng màu** — luôn kèm icon và nhãn chữ.
7. **Canvas bản vẽ luôn nền trắng** ở cả hai theme.
8. **Spacing chỉ theo thang 4px**, khoảng cách giữa block mặc định 24px (`gap-6`).
9. Mọi khu vực dữ liệu phải có đủ **loading / empty / error / data**.
10. Import một chiều: `app/` → `features/` → `shared/`. `page.tsx` chỉ import container. `components/` không gọi API.
11. Code và tên type bằng tiếng Anh; chuỗi hiển thị tiếng Việt, gom trong `*.constants.ts` của feature.

## Cách làm việc

- Giai đoạn hiện tại: **thiết lập nguyên lý thiết kế**, chưa dựng feature. Các file trong `features/` mới là stub.
- Thêm enum mới trong `shared/constants/enums.ts` thì phải thêm token tương ứng trong `app/globals.css` **và** cập nhật `context/design-system.md` cùng lúc.
- Khi chưa rõ yêu cầu hoặc thấy task vượt phạm vi đã chốt — hỏi trước, đừng tự quyết.
