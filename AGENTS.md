<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Arch Drawing Checker AI

Hệ thống hỗ trợ soát bản vẽ kiến trúc bằng VLM + OCR + document parsing. Đồ án tốt nghiệp, 2 người, 6 tháng, 2 giai đoạn: nghiên cứu/đánh giá rồi xây dựng hệ thống (giai đoạn 2 giữ ở mức proof-of-concept).

**Giai đoạn hiện tại: dựng khung xương UI bằng mock data.** Giao diện phải hiện đầy đủ và bấm được; chưa có backend, chưa có tính năng thật ngoài điều hướng và tương tác cục bộ trong trang.

## Đọc gì trước khi code

Thứ tự này có chủ đích. Bỏ qua bước 1 là nguyên nhân phổ biến nhất khiến làm trùng hoặc làm sai hướng.

| # | File | Dùng để |
|---|---|---|
| 1 | `context/project-state.md` | **Bắt buộc.** Cái gì đã xong, cái gì là vỏ rỗng, cái gì cố ý chưa làm |
| 2 | `context/domain-model.md` | Từ vựng nghiệp vụ: enum, nhãn, phân cấp, quy tắc suy dẫn |
| 3 | `context/decisions.md` | Vì sao làm như hiện tại + danh sách bẫy đã gặp |
| 4 | `context/design-system.md` | Token, màu, typography, spacing, a11y |
| 5 | `context/ui-conventions.md` | Bố cục, cấu trúc thư mục, đặt tên, theme |
| 6 | `context/component-recipes.md` | Khuôn code lấy từ repo thật |
| 7 | `context/progress/*.md` | Nhật ký từng giai đoạn, đọc khi cần biết một quyết định ra đời thế nào |

Nguồn sự thật trong code, ưu tiên hơn mọi tài liệu nếu có mâu thuẫn:

- `shared/constants/enums.ts` — enum miền
- `shared/constants/domain.ts` — nhãn, màu, thứ tự
- `app/globals.css` — giá trị token

## Stack

Next.js 16.3.5 (App Router) · React 19.2.8 · TypeScript strict · Tailwind v4 (`@tailwindcss/postcss`, không có `tailwind.config`) · alias `@/*` → repo root, không có `src/`.

Dependencies chỉ có `next`, `react`, `react-dom`. Không có clsx / cva / lucide / zustand — xem `decisions.md` D-02 trước khi cài thêm.

## Phạm vi đã chốt — không mở rộng khi chưa hỏi

- Một loại công trình: nhà ở biệt thự / nhà dân
- Bộ tiêu chí CHTK 5 nhóm, 4 loại kiểm tra A–D
- Giai đoạn 2 của đồ án giữ ở mức proof-of-concept

## Nguyên tắc bất di bất dịch

1. **Không hard-code màu.** Mọi màu đi qua token semantic (`bg-surface-raised`, `text-text-muted`, `bg-fail-subtle`). Không dùng palette mặc định của Tailwind.
2. **Không viết `dark:` cho màu.** Token tự đổi theo theme. Mặc định là dark.
3. **Class Tailwind phải là chuỗi tĩnh**, khai trong config map — không ghép động kiểu `bg-${status}`.
4. **Trạng thái và mức độ là hai trục độc lập**, không gộp thành một badge.
5. **`warning` / `pending` là trạng thái hạng nhất.** Kết quả dưới ngưỡng tin cậy không được ép thành `fail`.
6. **Luôn hiển thị độ tin cậy và tham chiếu trang** cạnh mọi kết luận tự động.
7. **Trạng thái không bao giờ chỉ bằng màu** — luôn kèm icon và nhãn chữ.
8. **Canvas bản vẽ luôn nền trắng** ở cả hai theme.
9. **Spacing chỉ theo thang 4px**, khoảng cách giữa block mặc định 24px (`gap-6`).
10. Import một chiều: `app/` → `features/` → `shared/`. Feature không import feature. `page.tsx` chỉ import container.
11. Code và type tiếng Anh; chuỗi hiển thị tiếng Việt, gom trong `constants` của feature.

## Quy trình làm việc

- **Trước khi tạo file mới:** tra `project-state.md` mục 2 và 3. Phần lớn file đã tồn tại dưới dạng stub — điền vào, đừng tạo file song song.
- **Thêm giá trị enum:** sửa `shared/constants/enums.ts` + `shared/constants/domain.ts` + `app/globals.css` + `context/domain-model.md` trong cùng một lần.
- **Trước khi coi là xong:** `npm run build` phải sạch. Nó chạy type check trên toàn bộ file trong `tsconfig.include`, kể cả file không ai import.
- **Xong một giai đoạn:** thêm một file vào `context/progress/`, cập nhật `project-state.md`, và ghi quyết định mới vào `decisions.md`.
- Khi chưa rõ yêu cầu hoặc thấy task vượt phạm vi đã chốt — **hỏi trước, đừng tự quyết**.
