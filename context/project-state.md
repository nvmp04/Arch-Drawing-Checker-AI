# Trạng thái dự án

**Cập nhật: 2026-09-23 (sau giai đoạn 06).** Đọc file này TRƯỚC KHI viết bất kỳ dòng code nào, để biết cái gì đã có, cái gì còn là vỏ rỗng, cái gì cố ý chưa làm.

Giai đoạn hiện tại: **dựng khung xương UI bằng mock data**. Giao diện phải hiện ra đầy đủ và bấm được, nhưng chưa có backend, chưa có tính năng thật ngoài điều hướng và tương tác cục bộ trong trang.

## 1. Bảng trạng thái theo trang

| Trang | Route | Trạng thái | Ghi chú |
|---|---|---|---|
| App shell | `app/[slug]/layout.tsx` | **Xong** | Chỉ còn Sidebar + main, **không có Topbar nữa** (xem D-16) |
| Bảng điều khiển | `/[slug]/dashboard` | **Xong (mock)** | 4 KPI, 2 biểu đồ, top 10 tiêu chí, hồ sơ gần đây |
| Hồ sơ thẩm định | `/[slug]/reviews` | **Xong (mock)** | List + nút "Thẩm định mới" → `/new` (upload PDF + form) → `/[reviewId]/processing` (mô phỏng AI) → `/[reviewId]` (khung xem bản vẽ + kết quả) |
| Kết quả tiêu chí | `/[slug]/findings` | **Xong (mock)** | Cây 3 cấp, tooltip, lọc theo trạng thái |
| Tiêu chuẩn CHTK | `/[slug]/rules` | **Đã nối backend thật** — không còn mock | Nạp file Excel → backend đọc → hiển thị bộ tiêu chuẩn thật (D-26…D-30). Dropdown chọn bộ, cascading filter, toggle, action menu, "Thêm tiêu chí mới". Container nhận prop `workspaceSlug` |
| Phân khu | `/[slug]/zones` | Vỏ rỗng | Cả nhánh `/[zoneId]/*` |
| Thành viên | `/[slug]/members` | Vỏ rỗng | |
| Hộp thư | `/[slug]/inbox` | Vỏ rỗng | |
| Việc của tôi | `/[slug]/my-tasks` | Vỏ rỗng | Route + container stub, mình tạo ở giai đoạn 01 |

"Vỏ rỗng" = file tồn tại, `page.tsx` import container, container render tiêu đề + `EmptyState`. Không phải chưa có — **đừng tạo lại**.

Năm trang đã xong ở trên giờ lấy dữ liệu qua **TanStack Query** và có đủ bốn nhánh loading / error / empty / data (D-22, D-23). Bốn trang vỏ rỗng chưa nối — khi làm tới thì điền `service` + `queryKeys` + `hook` của feature đó theo đúng khuôn của reviews / rules / findings.

## 2. Component dùng chung đã có — KHÔNG viết lại

| File | Việc nó làm |
|---|---|
| `shared/components/icons.tsx` | Bộ icon SVG inline tự viết (26 icon). Đặt tên theo lucide để sau thay 1-đổi-1 |
| `shared/components/Tooltip.tsx` | Khung chú thích hover, kèm `TipTitle` / `TipText` / `TipMeta` |
| `shared/components/Switch.tsx` | Công tắc bật/tắt, `role="switch"` |
| `shared/components/CascadingFilterMenu.tsx` | Menu lọc đa cấp 2 tầng, multi-select, click-outside, Escape. **Không biết gì về miền** — tái dụng được cho mọi trang |
| `shared/components/ThemeToggle.tsx` | Đổi theme bằng class `dark` trên `<html>`, nhớ bằng localStorage |
| `shared/components/StatusStackedBar.tsx` | Thanh phân rã 6 trạng thái + `StatusLegend` + `totalOf` + `EMPTY_STATUS_COUNTS` |
| `shared/components/EmptyState.tsx` | Một dòng chữ mờ, dùng cho mọi trang vỏ rỗng |
| `shared/components/ErrorState.tsx` | Trạng thái lỗi: icon + chữ + nút "Thử lại". Truyền thẳng `refetch` của TanStack Query vào `onRetry`. Kèm `errorDetail()` để lấy câu mô tả từ một lỗi bất kỳ |
| `shared/components/Skeleton.tsx` | Khối chờ: `Skeleton` (một khối), `SkeletonBlock` (vùng chờ có `role="status"` — **mọi màn chờ phải bọc qua đây**), `SkeletonText`, `SkeletonList` |
| `shared/services/apiClient.ts` | Lớp bọc `fetch`: get/post/patch/delete, mở bọc `{ data }`, ném `ApiError` có `status` + `isRetryable`. **Điểm nối backend duy nhất** — chưa nơi nào gọi tới |
| `shared/services/queryClient.ts` | Cấu hình TanStack Query dùng chung + `getQueryClient()` (server tạo mới, trình duyệt giữ một bản) |
| `shared/utils/number.ts` | `clamp`, `percentOf`, `ratioToPercent`, `roundTo` |
| `shared/utils/format.ts` | `formatFileSize`, `formatPercent`, `todayIsoDate` |
| `shared/utils/storage.ts` | Đọc/ghi Web Storage có guard SSR + `try/catch`, thất bại êm. Có bản JSON |
| `shared/utils/async.ts` | `resolveAfterDelay` (độ trễ giả lập của service mock), `delay`, `MOCK_DELAY_MS` |
| `shared/hooks/useDebounce.ts` | Hoãn giá trị cho ô tìm kiếm / bộ lọc gõ tay |
| `shared/hooks/useMediaQuery.ts` | Theo dõi media query qua `useSyncExternalStore`. **Lần render đầu ở client luôn `false`** |
| `app/providers.tsx` | `AppProviders` — `QueryClientProvider` + devtools (chỉ ở dev), đã nối vào `app/layout.tsx` |
| `shared/components/layout/Sidebar.tsx` | Điều hướng trái, 2 nhóm, active theo `usePathname` |
| `shared/components/Modal.tsx` | Khung dialog dùng chung: overlay + panel giữa màn hình, Escape + click-outside |
| `shared/constants/enums.ts` | **Nguồn sự thật** cho mọi enum miền |
| `shared/constants/domain.ts` | **Nguồn sự thật** cho nhãn / màu / thứ tự / mô tả của các enum đó |
| `features/dashboard/components/{KpiCard,SectionCard}.tsx` | Ô số liệu và khung card có link "Xem tất cả" |
| `features/reviews/components/ReviewListItem.tsx` | Dòng hồ sơ thẩm định, dùng ở dashboard và trang reviews |
| `features/reviews/components/ReviewUploadForm.tsx` | Form tạo hồ sơ mới: dropzone PDF, tên/phân khu/tiêu chuẩn CHTK/loại nhà, chọn nhóm tiêu chí |
| `features/reviews/components/{DrawingPageViewer,MarkedPageList,FindingResultPanel,FindingResultCard,ReviewWorkspace}.tsx` | Trang `/[slug]/reviews/[reviewId]`: viewer PDF (pdf.js, pan/zoom) + danh sách trang đánh dấu + khung kết quả 3 tab |
| `features/rules/components/AddRuleModal.tsx` | Modal "Thêm tiêu chí mới", đủ trường của `Rule` |
| `features/rules/components/StandardSetBar.tsx` | Dropdown chọn bộ tiêu chuẩn đang xem + siêu dữ liệu (tên file, số tiêu chí, ngày nạp) + nút "Nhập bộ tiêu chuẩn" |
| `features/rules/components/ImportStandardSetModal.tsx` | Modal nạp Excel: dropzone, kiểm đuôi file + dung lượng, gửi lên backend, hiện kết quả |

## 3. Stub còn rỗng (file có sẵn từ scaffold, chưa dùng)

`shared/components/DataTable.tsx`, `shared/components/Pagination.tsx`, `shared/stores/*` (mới là type, chưa có zustand).

Toàn bộ `features/{inbox,members,zones}/**`, `features/rules/components/{HouseTypeFilter,ThresholdEditor}.tsx`, `features/findings/store/*`, `features/findings/containers/FindingDetailPanelContainer.tsx` và `features/findings/hooks/useFindingVerdictMutation.ts` (xem D-17 vì sao **cố ý** chưa dùng), `features/dashboard/constants/dashboard.constants.ts`, `features/my-tasks/**`.

Khi tới lượt làm feature nào thì **điền vào các file này**, đừng tạo file mới song song.

### Lớp dữ liệu đã điền ở giai đoạn 06

| Feature | Service | Query keys | Hook |
|---|---|---|---|
| reviews | `listReviews`, `getReview`, `listReviewFindings`, `listFormOptions`, `createReview`, `getCheckTypeBreakdown` | `review.queryKeys.ts` | `useReviews`, `useReviewDetail`, `useReviewFormOptions`, `useCreateReview`, `useReviewProcessingStatus` |
| rules | `listStandardSets`, `listRules(slug, ruleSetId)`, `createRule`, **`importStandardSet` (API thật)** | `rule.queryKeys.ts` | `useStandardSets`, `useRules`, `useImportStandardSet` |
| findings | `listFindings` | `finding.queryKeys.ts` | `useFindings` |
| dashboard | `getOverview` (+ `buildDashboardSummary`, `pickPriorityFindings` vẫn là hàm thuần) | `dashboard.queryKeys.ts` | `useDashboardSummary` |

`reviews.service.ts` mất `listStandardSets` / `listZoneOptions`, gộp thành `listFormOptions` (một query thay hai).

## 4. Nợ kỹ thuật đã biết

- Ba file chết, chỉ còn một dòng re-export để build không gãy — **nên xóa hẳn**:
  `features/findings/components/DrawingGroupSection.tsx`,
  `features/dashboard/components/PassRateByGroupChart.tsx`,
  `features/dashboard/components/ConclusionByCheckTypeChart.tsx`.
- `README.md` vẫn là bản mặc định của create-next-app.
- Trang findings cấp zone (`/[slug]/zones/[zoneId]/findings`) hiện hiển thị đúng dữ liệu như cấp workspace, chưa lọc theo `zoneId`.
- `features/rules` menu thao tác mới `console.log`, công tắc và tiêu chí mới thêm qua modal mới lưu trong state cục bộ của `RuleList` (mất khi tải lại trang) — **chưa nối mutation**, dù `useCreateReview` đã có làm khuôn mẫu.
- **Hai nguồn "bộ tiêu chuẩn" song song** (D-25): `features/rules` có `StandardSet` (khớp `RuleSetSummaryEntity` của backend); `features/reviews` vẫn có `ChtkStandardSet` + 2 bộ mock cho form tạo hồ sơ. Gộp khi `GET /{ws}/rules` hết 501 — lúc đó cả hai đọc chung một endpoint.
- **Bộ vừa nạp mất khi tải lại trang** (D-29): backend đọc được Excel nhưng chưa ghi CSDL, `GET /{ws}/rules` trả 501. Kết quả giữ trong biến module của `rules.service.ts`.
- **Ô "Bộ tiêu chuẩn" của dashboard hiện 0/0** vì `MOCK_RULES` đã khóa (D-28). Sửa khi backend gỡ 501.
- `features/rules` là **nơi duy nhất trong repo gọi `apiClient`**. Các service khác vẫn trả mock.
- `RuleActionMenu`, công tắc bật/tắt, "Thêm tiêu chí mới" vẫn là state cục bộ / `console.log` — endpoint tương ứng đều 501.
- `.env.local` không commit; hợp đồng nằm ở `.env.example` (đã thêm ngoại lệ `!.env.example` vào `.gitignore`).
- `shared/stores/*` mới khai báo type, chưa nối zustand.
- HTML do server trả về của năm trang đã nối TanStack Query là **khung chờ**, không phải dữ liệu (D-23). Muốn SSR nội dung thật thì thêm prefetch + `HydrationBoundary` ở `page.tsx`, hook không phải sửa.
- `shared/components/ErrorState.tsx` chưa có nơi nào kiểm được bằng mắt: service mock không có đường nào ném lỗi. Muốn xem thì tạm cho một service `Promise.reject`.
- `npm run lint` còn **một lỗi có sẵn từ trước**: `shared/components/ThemeToggle.tsx:23` gọi `setState` đồng bộ trong `useEffect` (`react-hooks/set-state-in-effect`). Không sinh ra ở giai đoạn 06; sửa đúng cách là chuyển phần khởi tạo theme sang `next-themes` hoặc script inline (D-02).
- Dashboard tính hai biểu đồ từ tiêu chí chi tiết của một hồ sơ mock, còn bốn ô số liệu tính từ aggregate của mọi hồ sơ đã xong. Khi có backend thì cả hai lấy chung một endpoint summary.
- Trang `/[slug]/reviews/[reviewId]` chỉ có dữ liệu tiêu chí đầy đủ cho hồ sơ `rv-2026-018` (D-12); hồ sơ khác hiện khung xem trống.
- Khung xem bản vẽ dùng **chung một file PDF thật** (`public/mock/PN2-DN-01.pdf`, 48 trang, ~20MB) cho mọi hồ sơ — chưa có backend lưu file PDF thật đã tải lên theo từng hồ sơ. `scripts/generate-sample-pdf.mjs` vẫn giữ làm phương án dự phòng (sinh PDF giả lập, không phụ thuộc thư viện) khi không có file mẫu thật.
- Tạo hồ sơ ở `/reviews/new` **đã nối backend thật** (`POST /workspaces/:slug/reviews`, multipart PDF — hợp đồng `docs/contracts/fe-review-upload.md` của backend). Phân khu / bộ rules ở form dùng id demo (UUID) vì backend chỉ nhận đúng các id đó. `getReview` đọc mock cho id `rv-…`, còn lại gọi `GET .../reviews/:id`. Trang `/processing` vẫn là đồng hồ giả, viewer vẫn dùng `MOCK_PDF_URL` — chưa nối polling / `GET .../file`.
- "Tiêu chuẩn CHTK" ở form tạo hồ sơ (`ChtkStandardSet`) hiện mock trong `features/reviews/mocks/standardSets.mock.ts`; tính năng tải Excel để tạo bộ mới chưa làm.

## 5. Thư viện

`package.json` có `next`, `react`, `react-dom`, **`pdfjs-dist`** (render PDF cho khung xem bản vẽ — D-16), **`pdf-lib`** (xuất PDF đánh dấu — D-19), **`@tanstack/react-query`** (lớp dữ liệu cho cả dự án — D-22) + devDeps, trong đó có `@tanstack/react-query-devtools`. **Không có** clsx, tailwind-merge, class-variance-authority, lucide-react, zustand, geist, next-themes.

Việc không cài các package còn lại là chủ đích, không phải thiếu sót — xem `decisions.md` mục D-02. Trước khi thêm một package, kiểm tra xem `shared/components` đã có sẵn thứ tương đương chưa.

`public/pdf.worker.min.mjs` là file copy từ `node_modules/pdfjs-dist` bởi script `postinstall` (`scripts/copy-pdf-worker.mjs`) — không commit, tự sinh lại sau `npm install`.

## 6. Lệnh kiểm tra

```bash
npm run dev      # dev server
npm run build    # gồm cả type check — phải sạch trước khi coi là xong
npm run lint
```
