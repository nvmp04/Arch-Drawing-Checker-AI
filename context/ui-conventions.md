# UI Conventions

Quy ước bố cục, cấu trúc và đặt tên — mô tả **repo đang có**, không phải dự định.

## 1. Stack

- Next.js **16.3.5** (App Router) · React 19.2.8 · TypeScript strict
- Tailwind **v4** qua `@tailwindcss/postcss`, **không có** `tailwind.config` — token khai trong `app/globals.css` bằng `@theme inline`
- Alias `@/*` → thư mục gốc repo. **Không có `src/`**
- Dependencies: chỉ `next`, `react`, `react-dom`. Xem `decisions.md` D-02 trước khi định cài thêm

> Next 16 có breaking change so với 15. Trước khi dùng API của Next, đọc `node_modules/next/dist/docs/` theo nhắc nhở trong `AGENTS.md`. Đã gặp: `params` là `Promise` phải `await`; root layout dùng type helper `LayoutProps<"/">`.

## 2. App shell

`app/[slug]/layout.tsx`:

```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │  main — p-6, min-w-0                          │
│ w-64     │                                                │
│ fixed    │                                                │
│ (256px)  │                                                │
└──────────┴──────────────────────────────────────────────┘
```

- **Sidebar** cố định trái, 256px (`w-64`), main bù `pl-64`. Nền `surface-raised`, `border-r border-border-subtle`.
- Không có Topbar — đã bỏ cùng `WorkspaceSwitcher` (rỗng, không mang chức năng thật) để nhường không gian cho vùng làm việc chính; xem `decisions.md` D-16.
- `main` luôn `min-w-0`. **Lưu ý** (bẫy T-07): `pl-64` (bù Sidebar) và `p-6` (padding trang) phải nằm ở **hai phần tử khác nhau** — gộp chung một chỗ thì `p-6` đè mất `pl-64` vì cả hai cùng set `padding-left`.

Chưa có panel chi tiết bên phải và chưa có drawer cho màn hẹp — khi làm, giữ token `--inspector-width` (360px) đã khai sẵn.

## 3. Điều hướng

```
/[slug]/dashboard | reviews | findings | rules | zones | members | inbox | my-tasks
/[slug]/reviews/new
/[slug]/reviews/[reviewId]
/[slug]/reviews/[reviewId]/processing
/[slug]/zones/[zoneId]/{reviews,findings,rules,members}
```

Sidebar chia hai nhóm: **Không gian làm việc** (dashboard → members) và **Cá nhân** (Hộp thư, Việc của tôi).

Zone là cấp lồng có đủ tab riêng. Quy ước: **dùng lại chính container của cấp workspace**, chỉ khác nguồn dữ liệu — không nhân bản UI. Hệ quả: đổi props của container thì phải sửa cả hai route (bẫy T-03).

## 4. Cấu trúc thư mục

```
app/
  [slug]/<tab>/page.tsx        chỉ import container, không chứa JSX nghiệp vụ
  globals.css                  nguồn sự thật về token
features/<feature>/
  components/   presentational; giữ được state UI cục bộ, không gọi API
  containers/   ghép dữ liệu + components; là thứ page import
  constants/    config map: nhãn, icon, class theo enum
  mocks/        dữ liệu giả lập, tách khỏi services
  types/        <feature>.types.ts
  hooks/ services/ store/      còn rỗng ở phần lớn feature
shared/
  components/         dùng chung, KHÔNG biết miền bài toán
    layout/           Sidebar, Topbar, WorkspaceSwitcher
  constants/enums.ts  nguồn sự thật cho enum miền
  constants/domain.ts nguồn sự thật cho nhãn / màu / thứ tự
  hooks/ services/ stores/ types/
```

Import một chiều: `app/` → `features/` → `shared/`. **Feature không import feature khác** — thứ dùng chung thì đưa lên `shared`.

## 5. Đặt tên

- Component `PascalCase.tsx`; container `XxxContainer.tsx`; hook `useXxx.ts`
- `xxx.types.ts`, `xxx.constants.ts`, `xxx.service.ts`, `useXxxStore.ts`
- Tên code và type bằng tiếng Anh; chuỗi hiển thị tiếng Việt, gom trong `constants` của feature, không rải khắp JSX

## 6. Styling

- Class Tailwind trực tiếp trong JSX; biến thể bằng object config (xem `component-recipes.md` mục 1)
- Trạng thái dùng `data-*` + biến thể `data-[...]:` thay vì ghép class trong JS
- Thứ tự class: layout → spacing → typography → màu → border/shadow → state → responsive

## 7. Trạng thái UI bắt buộc

Mọi khu vực dữ liệu phải xử lý đủ **loading / empty / error / data**. Hiện mới có empty (`EmptyState`) vì chưa có API — khi nối backend phải bổ sung skeleton và error.

## 8. Theme

- Mặc định **dark**: class `dark` đặt sẵn trên `<html>` ở `app/layout.tsx`
- `globals.css` dùng selector `.dark`, **không** dùng `prefers-color-scheme`
- `ThemeToggle` tự bật/tắt class và nhớ bằng `localStorage`; khi nối `next-themes` thì thay phần logic, giữ phần hiển thị

## 9. Hiển thị kết quả AI

- Mọi finding phải hiện **trạng thái + độ tin cậy + tham chiếu trang**
- Phân biệt rõ giá trị máy trích xuất với giá trị tiêu chuẩn
- Không dùng ngôn từ khẳng định tuyệt đối: "Phát hiện sai lệch", không phải "Bản vẽ sai"

## 10. Kiểm thử

Chưa có test runner trong repo. Cách đang dùng để kiểm chứng tương tác: bundle component bằng esbuild rồi render trong jsdom và giả lập click. Lưu ý jsdom **không dựng được `mouseenter`** của React — phần hover phải thử tay trên trình duyệt.

Trước khi coi một việc là xong: `npm run build` phải sạch (nó chạy type check trên toàn bộ file trong `tsconfig.include`, kể cả file không ai import).
