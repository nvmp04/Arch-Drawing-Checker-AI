# UI Conventions — Arch Drawing Checker AI

Quy ước bố cục và cấu trúc, bám theo scaffold đang có trong repo. Đi kèm `design-system.md` (token) và `component-recipes.md` (code mẫu).

## 1. Stack thực tế

- Next.js **16.3.5** (App Router) · React 19.2.8 · TypeScript strict
- Tailwind **v4** qua `@tailwindcss/postcss`, **không có** `tailwind.config` — token khai báo bằng `@theme inline` trong `app/globals.css`
- Alias: `@/*` → thư mục gốc repo (không có `src/`). Ví dụ `@/shared/components/layout/Sidebar`

> Next 16 có breaking change so với 15. Trước khi viết code liên quan API của Next, đọc `node_modules/next/dist/docs/` theo đúng nhắc nhở trong `AGENTS.md`. Ví dụ đã thấy trong repo: `params` là `Promise` và phải `await`; root layout dùng type helper `LayoutProps<"/">`.

### Chưa cài — cần trước khi dùng recipes

```bash
npm i clsx tailwind-merge class-variance-authority lucide-react zustand geist next-themes
```

Trước khi cài `geist`, `--font-sans` trong `globals.css` tự fallback về system font nên app vẫn chạy.

## 2. App shell

Đang có: `app/[slug]/layout.tsx` = Sidebar cố định + Topbar + `<main className="p-6">`.

```
┌─────────────────────────────────────────────────────────┐
│  Topbar — h-16 (64px), border-b                         │
├───────────┬─────────────────────────────┬───────────────┤
│ Sidebar   │  main                       │  Detail panel │
│ w-64      │  flex-1, min-w-0            │  w-inspector  │
│ (256px)   │                             │  (360px)      │
└───────────┴─────────────────────────────┴───────────────┘
```

- **Sidebar** 256px (`w-64`, main bù `pl-64`), nền `surface-raised`, `border-r border-border-subtle`. Nav cấp 1: Dashboard, Reviews, Findings, Rules, Zones, Members, Inbox. Trạng thái active dùng `bg-surface-active text-text-primary`. Dưới `lg` → drawer (`useSidebarStore`).
- **Topbar** 64px, chứa `WorkspaceSwitcher` bên trái, `ThemeToggle` + inbox + user bên phải. Nền `surface-page`, `border-b`.
- **Detail panel** 360px: chỉ xuất hiện ở màn review detail và finding detail (`FindingDetailPanelContainer`). Dưới `xl` → sheet trượt phải.
- `main` luôn `min-w-0` để `DrawingPageViewer` không đẩy vỡ layout.

## 3. Phân cấp điều hướng

`Workspace (/[slug])` → `Zone` → `Review` → `Finding`

Zone là cấp lồng có đủ tab riêng (`/[slug]/zones/[zoneId]/{reviews,findings,rules,members}`) giống cấp workspace. Quy ước: **cùng một component list/container dùng lại cho cả hai cấp**, chỉ khác nguồn dữ liệu — không nhân bản UI cho cấp zone.

Breadcrumb ở Topbar phản ánh đúng chuỗi này; luôn hiện tên zone khi đang ở trong zone.

## 4. Bốn màn hình chính

1. **Dashboard** — KPI row (`KpiCard`) + 2 chart (`PassRateByGroupChart`, `ConclusionByCheckTypeChart`) + `PriorityFindingList` + `RecentReviewList`. Grid 12 cột, `gap-6`.
2. **Reviews** — list dạng card/table; `/new` là form upload; `/[reviewId]/processing` là màn tiến độ.
3. **Review detail** — `DrawingPageViewer` ở giữa + danh sách finding bên phải. Click finding → highlight vùng trên trang bản vẽ; click vùng → cuộn đến finding. **Liên kết hai chiều là hành vi bắt buộc.**
4. **Findings** — bảng có filter (verdict, status, reasoning group, confidence) + `FindingDetailPanelContainer` mở bên phải.

## 5. Breakpoints

Mặc định Tailwind. `< lg`: sidebar → drawer. `< xl`: detail panel → sheet. App ưu tiên desktop; mobile chỉ cần đọc được dashboard và danh sách finding.

## 6. Cấu trúc thư mục (đang có, giữ nguyên)

```
app/
  [slug]/
    dashboard|reviews|findings|rules|zones|members|inbox/
    layout.tsx
  globals.css              ← nguồn sự thật về token
features/<feature>/
  components/   presentational, nhận props, không gọi API
  containers/   ghép data + components, là thứ page import
  hooks/        useXxx — data fetching, side effect
  services/     gọi API
  store/        zustand, chỉ state UI (filter, selection)
  constants/  types/
shared/
  components/   dùng chung, không biết miền bài toán
    layout/     Sidebar, Topbar, WorkspaceSwitcher
  constants/enums.ts   ← enum miền, nguồn sự thật cho token trạng thái
  hooks/ services/ stores/ types/
```

Quy ước:

- **page.tsx chỉ import container**, không chứa JSX nghiệp vụ. Đang làm đúng vậy — giữ nguyên.
- `components/` không gọi API, không đọc store. Data đi qua `containers/`.
- `shared/components` không được import từ `features/`. Một chiều: `app/` → `features/` → `shared/`.
- `FindingStatusBadge` thuộc `features/findings`, `Button`/`Badge` chung thì thuộc `shared/components/ui/`.

## 7. Đặt tên (theo repo)

- Component: `PascalCase.tsx`. Container: `XxxContainer.tsx`. Hook: `useXxx.ts`.
- Type file: `xxx.types.ts`. Service: `xxx.service.ts`. Constants: `xxx.constants.ts`.
- Store: `useXxxStore.ts`.
- Enum miền để ở `shared/constants/enums.ts` nếu dùng chéo feature, còn lại để trong `features/<x>/types`.
- Tên code tiếng Anh, chuỗi hiển thị tiếng Việt. Map nhãn hiển thị trong `*.constants.ts` của feature, không rải chuỗi tiếng Việt khắp JSX.

## 8. Styling

- Tailwind class trực tiếp trong JSX, gộp điều kiện bằng `cn()` (`shared/lib/cn.ts`).
- Biến thể dùng `cva`, mỗi variant map thẳng sang token semantic.
- **Không giữ class mặc định của Tailwind cho màu** — scaffold hiện dùng `border-zinc-200`, `bg-white`, `hover:bg-zinc-100`; những chỗ này phải đổi sang token (`border-border-subtle`, `bg-surface-raised`, `hover:bg-surface-hover`).
- Thứ tự class: layout → spacing → typography → màu → border/shadow → state → responsive.
- JSX một dòng dài như trong scaffold hiện tại nên tách xuống nhiều dòng khi sửa tới.

## 9. Trạng thái UI bắt buộc

Mọi khu vực dữ liệu phải có đủ **loading (skeleton) / empty / error / data**.

- Loading: skeleton nền `surface-sunken`, không spinner toàn trang.
- Empty: icon mờ + một câu + một hành động chính (`EmptyState` đã có sẵn, cần hoàn thiện).
- Error: nền `fail-subtle`, chữ `fail-text`, có nút thử lại.
- Review đang xử lý: `ProcessingProgress` hiển thị theo từng bước (upload → OCR → parse → rule check) và theo từng trang, vì thời gian chờ dài.

## 10. Theme

- Mặc định **dark**: `<html className="dark">` đặt sẵn ở `app/layout.tsx`.
- `globals.css` dùng class `.dark`, **không** dùng `prefers-color-scheme` (default của create-next-app đã bị thay).
- `ThemeToggle` + `useThemeStore` là chỗ đổi theme; khi nối `next-themes` thì dùng `attribute="class"`, `defaultTheme="dark"` và thêm `suppressHydrationWarning` lên `<html>`.
- `DrawingPageViewer` không đổi theo theme — nền luôn `canvas-paper` trắng.

## 11. Hiển thị kết quả AI

- Mọi finding phải hiện **verdict + confidence + nguồn** (trang nào, vùng nào) — đã có `ConfidenceBadge` và `PageReferenceLink` trong scaffold.
- `ExtractedVsExpectedValue` phải phân biệt rõ giá trị máy trích xuất với giá trị kỳ vọng/đã người xác nhận; giá trị đã xác nhận có dấu hiệu riêng, không trộn lẫn.
- Không dùng ngôn từ khẳng định tuyệt đối cho kết quả máy: "Phát hiện sai lệch" thay vì "Bản vẽ sai".
