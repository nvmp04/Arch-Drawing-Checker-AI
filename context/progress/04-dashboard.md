# Giai đoạn 04 — Bảng điều khiển (dashboard)

Route: `/[slug]/dashboard`.

## Bố cục bốn hàng

1. **Bốn ô số liệu** (`KpiCard`): Việc cần xử lý · Tỷ lệ đạt trung bình · Tiêu chí đã kiểm tra · Bộ tiêu chuẩn.
2. **Hai biểu đồ**: `GroupPassRateChart` (tỷ lệ đạt theo 5 nhóm CHTK) và `CheckTypeBreakdownChart` (kết luận theo 4 loại kiểm tra).
3. **Cần xử lý trước** — 10 tiêu chí, dùng lại `FindingRow` của trang findings. "Xem tất cả" → `/findings`.
4. **Hồ sơ gần đây** — `ReviewListItem`. "Xem tất cả" → `/reviews`.

## Quy tắc tính

| Chỉ số | Công thức |
|---|---|
| Việc cần xử lý | `fail + warning + pending` trên các hồ sơ đã thẩm định xong |
| Tỷ lệ đạt trung bình | `(pass + approved) / (tổng − unknown)` — mục thiếu dữ liệu **không** vào mẫu số |
| Tiêu chí đã kiểm tra | tổng tiêu chí trên các hồ sơ `status = completed` |
| Tỷ lệ đạt theo nhóm | như trên, tính riêng từng nhóm CHTK; cột `? n` là số mục thiếu dữ liệu |

Mười tiêu chí ưu tiên: chỉ lấy mức **Cao** và **Nghiêm trọng**, duyệt lần lượt từng hồ sơ cho tới khi đủ 10. Trong mỗi hồ sơ sắp theo mức độ giảm dần, cùng mức thì **độ tin cậy cao lên trước** — chắc chắn sai thì làm trước.

Hồ sơ đang xử lý hoặc lỗi: thanh tiến độ thay cho thanh phân rã; tỷ lệ hiển thị `——`. Màu con số tỷ lệ: `< 50%` đỏ, `< 80%` hổ phách, còn lại xanh.

## File mới

| File | Vai trò |
|---|---|
| `shared/components/StatusStackedBar.tsx` | Thanh phân rã 6 trạng thái + `StatusLegend` + `totalOf` |
| `features/dashboard/services/dashboard.service.ts` | `buildDashboardSummary()` và `pickPriorityFindings()` |
| `features/dashboard/types/dashboard.types.ts` | Hình dạng của summary — chính là hình dạng API sau này |
| `features/dashboard/components/{KpiCard,SectionCard,GroupPassRateChart,CheckTypeBreakdownChart,PriorityFindingList,RecentReviewList}.tsx` | |
| `features/reviews/{types,mocks,components/ReviewListItem}` | Hồ sơ thẩm định, 6 bản ghi mock |

## Kiểm chứng bằng jsdom

Việc cần xử lý 101 · tỷ lệ đạt 59% (147/248) · đã kiểm tra 263 trên 4 hồ sơ xong · rule active 67/67. Tổng theo trạng thái `fail 62, warning 29, pending 10, pass 124, approved 23, unknown 15` — cộng khớp 263, và 263 − 15 = 248. Danh sách ưu tiên ra đúng 10 dòng: 4 mục Nghiêm trọng (94%, 90%, 83%, 82%) rồi 6 mục Cao giảm dần độ tin cậy.

## Đổi màu trạng thái "Đã duyệt"

Chạy validator của skill dataviz trên bộ 6 màu trạng thái: cặp `pass` (green-700) ↔ `approved` (teal-700) có ΔE **8.3** ở mắt thường — dưới ngưỡng 15, tức là người mắt bình thường cũng khó phân biệt khi hai đoạn nằm cạnh nhau trên thanh stacked. Cặp `approved` ↔ `unknown` còn tệ hơn ở mắt deutan (ΔE 1.3).

Đã đổi `--status-approved` sang **purple-700**. Kiểm lại: CVD separation PASS (18.2 deutan), normal-vision PASS (20.6), contrast PASS.

Hai cảnh báo còn lại là đặc tính của một thang **trạng thái**, không phải thang phân loại, nên chấp nhận: amber-700 nằm ngoài dải sáng chuẩn, và gray không có sắc độ. Bù lại bằng icon + nhãn chữ + hàng chú thích có số lượng — đúng điều kiện "relief" mà validator yêu cầu.

## Dọn dẹp kèm theo

- `STATUS_CONFIG`, `SEVERITY_CONFIG`, `STATUS_ORDER`, `SEVERITY_ORDER`, `CONFIDENCE_THRESHOLD` chuyển từ `features/findings/constants` sang `shared/constants/domain.ts`; mô tả tooltip gộp vào chính config (`description`). `finding.constants.ts` nay chỉ còn re-export + `COLLAPSED_BY_DEFAULT`.
- Mock findings đồng bộ `checkType` theo bảng rule: cùng một mã tiêu chí thì loại kiểm tra phải giống nhau ở cả hai mock. Phân bố mới: A 37, B 25, C 3, D 1.

## Còn treo

- `PassRateByGroupChart.tsx` và `ConclusionByCheckTypeChart.tsx` giờ chỉ là re-export sang tên mới — nên xóa.
- Biểu đồ theo nhóm và theo loại kiểm tra hiện tính trên tiêu chí chi tiết của **một** hồ sơ mock; bốn ô số liệu thì tính trên aggregate của tất cả hồ sơ đã xong. Khi có backend, cả hai lấy chung một endpoint summary.
- Chưa có bộ lọc khoảng thời gian, chưa có trạng thái loading/error.
