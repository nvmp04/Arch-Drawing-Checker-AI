# Giai đoạn 01 — App shell và Sidebar

Mục tiêu: hoàn thiện thiết kế sidebar theo hệ token, dựng khung điều hướng cho toàn app.

## Đã làm

- `shared/components/layout/Sidebar.tsx` — client component, active theo `usePathname`. Cấu trúc từ trên xuống:
  - hàng thương hiệu cao 64px (thẳng hàng Topbar) + nút dấu cộng trỏ `/[slug]/reviews/new`
  - nhóm **Không gian làm việc**: Bảng điều khiển, Hồ sơ thẩm định, Kết quả tiêu chí, Tiêu chuẩn CHTK, Phân khu, Thành viên
  - nhóm **Cá nhân**: Hộp thư, Việc của tôi
  - chân: avatar chữ cái + tên tài khoản + chức danh + `ThemeToggle`
- `shared/components/icons.tsx` — bộ icon SVG inline, không phụ thuộc package ngoài.
- `shared/components/ThemeToggle.tsx` — bật/tắt class `dark`, nhớ bằng `localStorage` khóa `adc-theme`.
- Route mới `/[slug]/my-tasks` + `features/my-tasks/containers/MyTaskListContainer.tsx`.

## Sửa kèm vì đổi token ở giai đoạn 00

- `app/[slug]/layout.tsx`: `bg-background` (token không còn tồn tại) → `bg-surface-page`.
- `shared/components/layout/Topbar.tsx`: `border-zinc-200 bg-white` → token.
- `shared/components/EmptyState.tsx`: `text-zinc-500` → `text-text-muted`.

## Còn treo

- Tên tài khoản là placeholder "Nguyễn Văn A", chức danh "Chủ nhiệm thẩm định" — chưa có auth.
- Sidebar chưa có bản drawer cho màn hẹp; `shared/stores/useSidebarStore.ts` mới là type.
- Mục "Thêm" trong yêu cầu gốc bị bỏ vì trùng route `/inbox` với "Hộp thư".
