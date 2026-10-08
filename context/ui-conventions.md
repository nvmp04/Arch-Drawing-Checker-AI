# UI Conventions

Quy ước bố cục, cấu trúc và đặt tên — mô tả **repo đang có**, không phải dự định.

## 1. Stack

- Next.js **16.3.5** (App Router) · React 19.2.8 · TypeScript strict
- Tailwind **v4** qua `@tailwindcss/postcss`, **không có** `tailwind.config` — token khai trong `app/globals.css` bằng `@theme inline`
- Alias `@/*` → thư mục gốc repo. **Không có `src/`**
- Lấy dữ liệu: **TanStack Query v5** (`decisions.md` D-22). Provider ở `app/providers.tsx`, cấu hình ở `shared/services/queryClient.ts`
- Dependencies: `next`, `react`, `react-dom`, `pdfjs-dist`, `pdf-lib`, `@tanstack/react-query`. Xem `decisions.md` D-02 trước khi định cài thêm

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
  [slug]/<tab>/page.tsx        Server Component: await params, chỉ import container
  providers.tsx                "use client" — QueryClientProvider + devtools
  layout.tsx                   bọc children trong <AppProviders>
  globals.css                  nguồn sự thật về token
features/<feature>/
  components/   presentational; giữ được state UI cục bộ, không gọi API
  containers/   "use client" — gọi hook của feature, render 4 nhánh; là thứ page import
  constants/    config map (<feature>.constants.ts) + khóa cache (<feature>.queryKeys.ts)
  hooks/        useXxx.ts — bọc useQuery/useMutation, KHÔNG lọc/sắp xếp trong này
  services/     <feature>.service.ts — trả Promise, là chỗ duy nhất đổi khi có backend
  mocks/        dữ liệu giả lập, tách khỏi services
  types/        <feature>.types.ts
  store/        còn rỗng ở mọi feature
shared/
  components/         dùng chung, KHÔNG biết miền bài toán
    layout/           Sidebar
  constants/enums.ts  nguồn sự thật cho enum miền
  constants/domain.ts nguồn sự thật cho nhãn / màu / thứ tự
  services/           apiClient.ts (lớp bọc fetch), queryClient.ts (cấu hình TanStack Query)
  utils/              hàm thuần: number, format, storage, async
  hooks/ stores/ types/
```

Import một chiều: `app/` → `features/` → `shared/`. **Feature không import feature khác** — thứ dùng chung thì đưa lên `shared`. Hai ngoại lệ có chủ đích và có giới hạn: dashboard (D-13) và review-detail (D-17), cả hai chỉ được import **type / mock / component presentational**, không được import container hay hook của feature khác.

Bốn tầng, mỗi tầng một việc — đừng trộn:

```
service   Promise, không biết React          ← chỗ duy nhất đổi khi có backend
queryKeys mảng khóa cache, rộng → hẹp
hook      useQuery/useMutation, không xử lý dữ liệu
container "use client", 4 nhánh loading/error/empty/data
```

## 5. Đặt tên

- Component `PascalCase.tsx`; container `XxxContainer.tsx`; hook `useXxx.ts`
- `xxx.types.ts`, `xxx.constants.ts`, `xxx.queryKeys.ts`, `xxx.service.ts`, `useXxxStore.ts`
- Factory khóa cache đặt tên theo số ít: `reviewKeys`, `ruleKeys`, `findingKeys`, `dashboardKeys`
- Tên code và type bằng tiếng Anh; chuỗi hiển thị tiếng Việt, gom trong `constants` của feature, không rải khắp JSX

## 6. Styling

- Class Tailwind trực tiếp trong JSX; biến thể bằng object config (xem `component-recipes.md` mục 1)
- Trạng thái dùng `data-*` + biến thể `data-[...]:` thay vì ghép class trong JS
- Thứ tự class: layout → spacing → typography → màu → border/shadow → state → responsive

## 7. Trạng thái UI bắt buộc

Mọi khu vực dữ liệu phải xử lý đủ **loading / empty / error / data**. Đã có đủ cả bốn ở năm trang đã nối TanStack Query; thứ tự kiểm luôn là:

```tsx
const { data, isPending, isError, error, refetch } = useXxx(workspaceSlug);

isPending ? <SkeletonList label="Đang tải…" />
: isError ? <ErrorState message="Không tải được…" detail={errorDetail(error)} onRetry={() => void refetch()} />
: data.length === 0 ? <EmptyState message="Chưa có…" />
: <XxxList items={data} />
```

Bốn điều bắt buộc:

- Kiểm `isPending` / `isError` **trước** khi đọc `data`. Làm đúng thứ tự này thì TypeScript tự thu hẹp `data` về không-undefined, không cần `!` hay `?.`.
- Khung chờ phải **giữ đúng bố cục trang thật** (đúng số ô, đúng số cột), nếu không nội dung nhảy khi dữ liệu về.
- Khung chờ bọc trong `SkeletonBlock` (`role="status"` + `aria-busy`), không đặt `Skeleton` trần.
- "Không tìm thấy" là **empty**, không phải **error**. Xem bẫy T-14: `queryFn` trả `undefined` sẽ biến nó thành error.

Nút "Thử lại" của `ErrorState` nhận thẳng `refetch` của TanStack Query.

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
