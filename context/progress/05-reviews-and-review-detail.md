# Giai đoạn 05 — Hồ sơ thẩm định: tạo mới, xử lý, và trang chi tiết

Route: `/[slug]/reviews`, `/[slug]/reviews/new`, `/[slug]/reviews/[reviewId]/processing`, `/[slug]/reviews/[reviewId]`.

## Bỏ Topbar

`app/[slug]/layout.tsx` không còn `<Topbar/>` — chỉ còn `Sidebar` + `main`. `Topbar.tsx` và `WorkspaceSwitcher.tsx` đã xóa hẳn (không còn nơi import). Lý do và bẫy padding liên quan: `decisions.md` D-16, T-07.

## Luồng tạo hồ sơ mới

`reviews` (danh sách, nút "Thẩm định mới") → `reviews/new` (`ReviewUploadForm`: dropzone PDF + tên/phân khu/tiêu chuẩn CHTK/loại nhà + chọn nhóm tiêu chí, cả hai đều bắt buộc chọn ít nhất 1) → gọi `reviewsService.createReview()` (mock, trả `Review` mới `status: "processing"`) → điều hướng sang `reviews/[reviewId]/processing`.

`ProcessingProgress` mô phỏng AI đọc bản vẽ bằng đồng hồ ở client (`useReviewProcessingStatus`, không có backend): thanh tiến độ + 5 bước xử lý (trích xuất → OCR → vật liệu → hình học → tổng hợp), xong thì hiện `CheckTypeBreakdownBars` (số phần tử phân tích theo A/B/C/D) + nút "Xem kết quả thẩm định bản vẽ" → `reviews/[reviewId]`.

Hồ sơ tạo mới không có trong `MOCK_REVIEWS`, được cất tạm vào `sessionStorage` để trang sau đọc lại (chi tiết: `decisions.md` D-16 phần hệ quả, và nợ kỹ thuật trong `project-state.md`).

Dữ liệu mock mới: `features/reviews/mocks/{zoneOptions,standardSets,checkTypeBreakdown}.mock.ts`. Khái niệm mới `ChtkStandardSet` ("bộ tiêu chuẩn CHTK" nạp từ Excel) hiện chỉ có type + mock trong `features/reviews` — tính năng tải Excel làm ở giai đoạn sau.

## Trang chi tiết hồ sơ — khung xem bản vẽ + kết quả thẩm định

`ReviewWorkspace` (client) là bộ não của trang: giữ `findings` (áp override cục bộ cho xác nhận/ghi chú), `currentPage`, `selectedFindingId`. Ba cột:

1. **`MarkedPageList`** — các trang có finding, mỗi trang một hàng chấm màu theo trạng thái (khử trùng, đúng `STATUS_ORDER`). Click → đổi trang, zoom fit cả trang.
2. **`DrawingPageViewer`** — pdf.js render trang lên canvas (oversample `RENDER_SCALE = 2.25` để zoom vẫn nét), pan/zoom bằng CSS transform tự viết (không có lib pan-zoom): lăn chuột zoom theo con trỏ, kéo rê để pan, nút zoom in/out/fit, điều hướng trang. Annotation (từ `Finding.boundingBox`, tính theo %) vẽ đè lên canvas trong cùng khối transform nên tự động ăn theo pan/zoom. Quyết định dùng `pdfjs-dist` thật (không phải placeholder) và các bẫy liên quan: `decisions.md` D-16, T-08, T-09.
3. **`FindingResultPanel`** — thanh phân rã trạng thái + 3 tab (Cần xử lý = `ACTION_REQUIRED_STATUSES`, Tất cả, Đạt = `PASSED_STATUSES`) + `FindingResultCard` (tái dùng badge presentational của `features/findings`).

Chọn một finding (từ panel hoặc click thẳng vào annotation trên canvas) đồng bộ hai chiều: viewer nhảy đúng trang + zoom vào đúng `boundingBox`; thẻ finding trong panel mở rộng, hiện nút **Xác nhận** (chuyển `status → "approved"`, không phải `"pass"` — lý do: `decisions.md` D-18) và **Ghi chú** (textarea, lưu vào state cục bộ của `ReviewWorkspace`).

Vì sao không dùng `FindingDetailPanelContainer`/`useFindingVerdictMutation` có sẵn trong `features/findings`: `decisions.md` D-17.

## Mock mới ở `features/findings`

`Finding` có thêm `boundingBox` (sinh bằng RNG seed cố định theo index, xem `mockBoundingBox()` trong `findings.mock.ts`) và `note?` (8 dòng có ghi chú thật, còn lại `undefined`).

## Rules — modal thêm tiêu chí

Nhân tiện làm cùng đợt: `RuleList` thêm hai nút — "Nhập Excel" (disabled, chỉ có Tooltip giải thích sẽ làm sau) và "Thêm tiêu chí mới" (mở `AddRuleModal`, dùng `shared/components/Modal.tsx` mới). Modal đủ trường của `Rule` (category suy tự động từ code, không nhập tay). Tiêu chí mới thêm vào state cục bộ của `RuleList` (mất khi tải lại trang) qua `rulesService.createRule()` (mock).

## Kiểm chứng

- `npm run build` và `npm run lint` sạch (trừ một lỗi có sẵn từ trước ở `ThemeToggle.tsx`, không thuộc phạm vi đợt này).
- Server-render `/arch-drawing-checker-ai/reviews/rv-2026-018` trả 200, payload chứa đủ 66 finding kèm `boundingBox`/`note`, không có error boundary nào kích hoạt.
- **Chưa kiểm chứng bằng trình duyệt thật**: pan/zoom, kéo rê, click annotation trên canvas, xác nhận/ghi chú — toàn bộ phần này chạy client-side (pdf.js + canvas), cần tự mở `/reviews/rv-2026-018` để xác nhận bằng mắt.

## Còn treo

- Chưa có trạng thái loading/error thật cho `DrawingPageViewer` ngoài thông báo text đơn giản.
- `sessionStorage` cho hồ sơ nháp là giải pháp tạm — xem lại khi có backend.
- Chưa test trên màn hẹp/mobile (3 cột cố định `w-28` / `1fr` / `360px` giả định màn rộng ≥ desktop).
