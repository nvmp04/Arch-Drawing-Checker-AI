# Trạng thái dự án

**Cập nhật: 2026-09-18 (sau giai đoạn 05).** Đọc file này TRƯỚC KHI viết bất kỳ dòng code nào, để biết cái gì đã có, cái gì còn là vỏ rỗng, cái gì cố ý chưa làm.

Giai đoạn hiện tại: **dựng khung xương UI bằng mock data**. Giao diện phải hiện ra đầy đủ và bấm được, nhưng chưa có backend, chưa có tính năng thật ngoài điều hướng và tương tác cục bộ trong trang.

## 1. Bảng trạng thái theo trang

| Trang | Route | Trạng thái | Ghi chú |
|---|---|---|---|
| App shell | `app/[slug]/layout.tsx` | **Xong** | Chỉ còn Sidebar + main, **không có Topbar nữa** (xem D-16) |
| Bảng điều khiển | `/[slug]/dashboard` | **Xong (mock)** | 4 KPI, 2 biểu đồ, top 10 tiêu chí, hồ sơ gần đây |
| Hồ sơ thẩm định | `/[slug]/reviews` | **Xong (mock)** | List + nút "Thẩm định mới" → `/new` (upload PDF + form) → `/[reviewId]/processing` (mô phỏng AI) → `/[reviewId]` (khung xem bản vẽ + kết quả) |
| Kết quả tiêu chí | `/[slug]/findings` | **Xong (mock)** | Cây 3 cấp, tooltip, lọc theo trạng thái |
| Tiêu chuẩn CHTK | `/[slug]/rules` | **Xong (mock)** | Cascading filter, toggle, action menu, nút "Nhập Excel" (placeholder) + "Thêm tiêu chí mới" (modal) |
| Phân khu | `/[slug]/zones` | Vỏ rỗng | Cả nhánh `/[zoneId]/*` |
| Thành viên | `/[slug]/members` | Vỏ rỗng | |
| Hộp thư | `/[slug]/inbox` | Vỏ rỗng | |
| Việc của tôi | `/[slug]/my-tasks` | Vỏ rỗng | Route + container stub, mình tạo ở giai đoạn 01 |

"Vỏ rỗng" = file tồn tại, `page.tsx` import container, container render tiêu đề + `EmptyState`. Không phải chưa có — **đừng tạo lại**.

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
| `shared/components/layout/Sidebar.tsx` | Điều hướng trái, 2 nhóm, active theo `usePathname` |
| `shared/components/Modal.tsx` | Khung dialog dùng chung: overlay + panel giữa màn hình, Escape + click-outside |
| `shared/constants/enums.ts` | **Nguồn sự thật** cho mọi enum miền |
| `shared/constants/domain.ts` | **Nguồn sự thật** cho nhãn / màu / thứ tự / mô tả của các enum đó |
| `features/dashboard/components/{KpiCard,SectionCard}.tsx` | Ô số liệu và khung card có link "Xem tất cả" |
| `features/reviews/components/ReviewListItem.tsx` | Dòng hồ sơ thẩm định, dùng ở dashboard và trang reviews |
| `features/reviews/components/ReviewUploadForm.tsx` | Form tạo hồ sơ mới: dropzone PDF, tên/phân khu/tiêu chuẩn CHTK/loại nhà, chọn nhóm tiêu chí |
| `features/reviews/components/{DrawingPageViewer,MarkedPageList,FindingResultPanel,FindingResultCard,ReviewWorkspace}.tsx` | Trang `/[slug]/reviews/[reviewId]`: viewer PDF (pdf.js, pan/zoom) + danh sách trang đánh dấu + khung kết quả 3 tab |
| `features/rules/components/AddRuleModal.tsx` | Modal "Thêm tiêu chí mới", đủ trường của `Rule` |

## 3. Stub còn rỗng (file có sẵn từ scaffold, chưa dùng)

`shared/components/DataTable.tsx`, `shared/components/Pagination.tsx`, `shared/hooks/*`, `shared/services/apiClient.ts`, `shared/stores/*` (mới là type, chưa có zustand), `shared/types/common.types.ts`.

Toàn bộ `features/{inbox,members,zones}/**`, `features/rules/components/{HouseTypeFilter,ThresholdEditor}.tsx`, `features/findings/{hooks,services,store}/*` (kể cả `FindingDetailPanelContainer` và `useFindingVerdictMutation` — xem D-17 vì sao chưa dùng) và `features/dashboard/{constants,hooks}/*` cũng vậy.

Khi tới lượt làm feature nào thì **điền vào các file này**, đừng tạo file mới song song.

## 4. Nợ kỹ thuật đã biết

- Ba file chết, chỉ còn một dòng re-export để build không gãy — **nên xóa hẳn**:
  `features/findings/components/DrawingGroupSection.tsx`,
  `features/dashboard/components/PassRateByGroupChart.tsx`,
  `features/dashboard/components/ConclusionByCheckTypeChart.tsx`.
- `README.md` vẫn là bản mặc định của create-next-app.
- Trang findings cấp zone (`/[slug]/zones/[zoneId]/findings`) hiện hiển thị đúng dữ liệu như cấp workspace, chưa lọc theo `zoneId`.
- `features/rules` menu thao tác mới `console.log`, công tắc và tiêu chí mới thêm qua modal mới lưu trong state cục bộ của `RuleList` (mất khi tải lại trang).
- `shared/stores/*` mới khai báo type, chưa nối zustand.
- Dashboard tính hai biểu đồ từ tiêu chí chi tiết của một hồ sơ mock, còn bốn ô số liệu tính từ aggregate của mọi hồ sơ đã xong. Khi có backend thì cả hai lấy chung một endpoint summary.
- Trang `/[slug]/reviews/[reviewId]` chỉ có dữ liệu tiêu chí đầy đủ cho hồ sơ `rv-2026-018` (D-12); hồ sơ khác hiện khung xem trống.
- Khung xem bản vẽ dùng **chung một file PDF thật** (`public/mock/PN2-DN-01.pdf`, 48 trang, ~20MB) cho mọi hồ sơ — chưa có backend lưu file PDF thật đã tải lên theo từng hồ sơ. `scripts/generate-sample-pdf.mjs` vẫn giữ làm phương án dự phòng (sinh PDF giả lập, không phụ thuộc thư viện) khi không có file mẫu thật.
- Hồ sơ tạo mới ở `/reviews/new` được cất tạm vào `sessionStorage` (khóa `review:draft:<id>`) để trang `/processing` đọc lại sau khi điều hướng — chỉ là cầu nối cho giai đoạn mock, bỏ khi có backend trả `Review` ngay trong response tạo hồ sơ.
- "Tiêu chuẩn CHTK" ở form tạo hồ sơ (`ChtkStandardSet`) hiện mock trong `features/reviews/mocks/standardSets.mock.ts`; tính năng tải Excel để tạo bộ mới chưa làm.

## 5. Thư viện

`package.json` có `next`, `react`, `react-dom`, **`pdfjs-dist`**, **`pdf-lib`** (xuất PDF đánh dấu — D-19) (render PDF cho khung xem bản vẽ — xem `decisions.md` D-16) + devDeps. **Không có** clsx, tailwind-merge, class-variance-authority, lucide-react, zustand, geist, next-themes.

Việc không cài các package còn lại là chủ đích, không phải thiếu sót — xem `decisions.md` mục D-02. Trước khi thêm một package, kiểm tra xem `shared/components` đã có sẵn thứ tương đương chưa.

`public/pdf.worker.min.mjs` là file copy từ `node_modules/pdfjs-dist` bởi script `postinstall` (`scripts/copy-pdf-worker.mjs`) — không commit, tự sinh lại sau `npm install`.

## 6. Lệnh kiểm tra

```bash
npm run dev      # dev server
npm run build    # gồm cả type check — phải sạch trước khi coi là xong
npm run lint
```
