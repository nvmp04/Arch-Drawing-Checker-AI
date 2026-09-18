# Giai đoạn 00 — Thiết lập nguyên lý thiết kế

Mục tiêu: dựng hệ token từ Geist Design System của Vercel, và bộ file ngữ cảnh cho context prompting. Chưa đụng tới feature.

## Đã làm

- `app/globals.css` — thay hẳn file mặc định của create-next-app. Ba lớp token:
  - primitive `--ds-*`, thang 100→1000 cho gray/blue/red/amber/green và 100/300/500/700/900/1000 cho teal/purple/pink, định nghĩa hai lần cho light và dark
  - semantic: `--surface-*`, `--text-*`, `--border-*`, `--accent*`, layout, radius, motion, z-index
  - `@theme inline` map sang utility Tailwind, đọc thẳng `var()` nên đổi theme runtime không cần `dark:`
- `app/layout.tsx` — thêm class `dark` và `suppressHydrationWarning` lên `<html>`. Theme mặc định là tối.
- `AGENTS.md` — nối phần dự án phía dưới block `nextjs-agent-rules` do `next dev` tự quản.
- `context/design-system.md`, `context/ui-conventions.md`, `context/component-recipes.md`.

## Quyết định chốt ở giai đoạn này

Xem `decisions.md`: D-01 (token ba lớp), D-05 (trạng thái không chỉ bằng màu), D-06 (canvas luôn trắng).

## Bẫy đã xử lý

`T-01` — tham chiếu vòng của `--radius-md` và `--ease-*` trong `@theme inline`.

## Lệch so với giả định ban đầu

Bản nháp đầu tiên đặt trạng thái là pass/fail/warn/skip và ba nhóm checklist title-block / consistency / symbols. Đọc repo thật mới thấy enum khác hẳn. Bài học: **đọc `shared/constants/enums.ts` trước khi đặt tên miền.**
