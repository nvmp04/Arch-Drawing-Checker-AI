# Giai đoạn 06 — TanStack Query + `shared/utils`

**2026-09-23.** Dựng lớp dữ liệu cho cả dự án và gom những hàm thuần đang bị chép lại nhiều chỗ.

Quyết định sinh ra ở giai đoạn này: **D-22** (cài TanStack Query), **D-23** (container thành Client Component), **D-24** (`shared/utils/`). Bẫy mới: **T-14**, **T-15**.

## Vì sao làm bây giờ

Hai việc tưởng rời nhau nhưng cùng một gốc: repo đã có sẵn khung thư mục `hooks/ services/ store/` cho mọi feature nhưng phần lớn là stub, nên mỗi trang tự xoay một kiểu — trang thì `async` Server Component gọi service, trang thì import thẳng `MOCK_*`. Không có chỗ nào chung để đặt trạng thái loading/error, và `ui-conventions.md` §7 đã ghi nợ điều đó từ giai đoạn 00.

Đáng chú ý: hai hook stub trong `shared/hooks` **trả giá trị giả** — `useDebounce` trả nguyên value, `useMediaQuery` luôn trả `false`. Kiểu stub này nguy hiểm hơn là chưa có file, vì nơi gọi tưởng nó chạy. Đã điền thật.

## Đã làm

**Hạ tầng.** `shared/services/queryClient.ts` (cấu hình + `getQueryClient()` tách server/browser), `app/providers.tsx` nối vào `app/layout.tsx`. `shared/services/apiClient.ts` từ một dòng `Promise.reject` thành lớp bọc `fetch` thật: get/post/patch/delete, mở bọc `{ data }`, `ApiError` có `status` + `isRetryable` để `retry` của TanStack Query đọc được. Chưa nơi nào gọi tới — cố ý, nó là điểm nối backend cho giai đoạn 2.

**Bốn feature có lớp dữ liệu đủ.** reviews, rules, findings, dashboard — mỗi feature một `service` + `queryKeys` + `hook`. `features/{inbox,members,zones}` để nguyên vì trang còn là vỏ rỗng; nối lớp dữ liệu cho một trang chưa có UI chỉ tạo code chết.

**Sáu container sang `"use client"`** với đủ bốn nhánh loading / error / empty / data. Thêm `shared/components/Skeleton.tsx` và `ErrorState.tsx`, thêm `RefreshCwIcon`.

**`shared/utils/`** — `number` (`clamp`, `percentOf`, `ratioToPercent`, `roundTo`), `format` (`formatFileSize`, `formatPercent`, `todayIsoDate`), `storage` (guard SSR + `try/catch`), `async` (`resolveAfterDelay`). Đã thay hết chỗ gọi: `DrawingPageViewer` bỏ `clamp` cục bộ, bốn chỗ tính phần trăm dùng `percentOf`, hai service dùng `resolveAfterDelay` chung, `ThemeToggle` và `reviews.service` dùng `storage`.

**`ReviewUploadForm`** chuyển từ gọi thẳng service sang `useCreateReview`. **`useReviewProcessingStatus`** giữ đồng hồ mô phỏng nhưng phần phân rã loại kiểm tra đã đi qua `useQuery` với `enabled: percent >= 100`.

## Kiểm chứng

`npm run build` sạch. `npm run lint` còn **một lỗi có sẵn từ trước** ở `ThemeToggle.tsx:23` (`set-state-in-effect`) — đã xác nhận bằng cách stash file rồi lint lại.

Không có Chrome trên máy và không cài được (thiếu quyền admin), nên kiểm bằng Playwright điều khiển **Edge** đã có sẵn, cài `playwright-core` ngoài repo. Đây là cách nhẹ hơn hẳn so với khuôn esbuild + jsdom ở `ui-conventions.md` §10, và **dựng được `mouseenter`** mà jsdom không dựng được.

Kiểm 7 đường: mỗi trang phải hiện khung chờ trước, rồi dữ liệu thật thay thế nó, khung chờ rời DOM hẳn, và console không có lỗi. Thêm một luồng đầy đủ: điền form → tạo hồ sơ → điều hướng sang `/processing` → chạy tới 100% → hiện phân rã loại kiểm tra. Tất cả PASS.

Hai lỗi bắt được nhờ mở trình duyệt, **build và type check đều xanh cả hai**:

1. **T-14** — hồ sơ không tồn tại hiện khung lỗi kèm nút "Thử lại" thay vì khung "Không tìm thấy", vì `queryFn` trả `undefined`.
2. Hai lần đầu test báo đỏ oan vì `isVisible({ timeout })` của Playwright **không chờ** — phải `waitFor`. Không phải lỗi sản phẩm, nhưng đáng ghi lại để lần sau không mất công đi tìm bug không có.

## Còn nợ lại

- Công tắc bật/tắt và tiêu chí thêm mới ở `features/rules` vẫn là state cục bộ trong `RuleList`, chưa nối mutation — `useCreateReview` đã có làm khuôn.
- `ErrorState` chưa xem được bằng mắt: service mock không có đường nào ném lỗi.
- HTML server trả về là khung chờ, không phải dữ liệu (D-23). Muốn SSR nội dung thật thì thêm prefetch + `HydrationBoundary` ở `page.tsx`; hook không phải sửa.
- `features/findings/containers/FindingDetailPanelContainer.tsx` và `useFindingVerdictMutation.ts` vẫn cố ý để trống (D-17), dù giờ đã có `useMutation` để viết cho đúng tên gọi.
