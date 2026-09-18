# Giai đoạn 03 — Trang Tiêu chuẩn CHTK (rules)

Route: `/[slug]/rules` và `/[slug]/zones/[zoneId]/rules`.

## Bộ lọc — cascading dropdown hai cấp

`shared/components/CascadingFilterMenu.tsx`, generic, không biết gì về miền.

- Cấp 1: Nhóm CHTK · Loại kiểm tra · Loại nhà · Phép so sánh
- Cấp 2 mở ra bên phải khi hover (`onMouseEnter`) hoặc click; `onFocus` cũng mở để đi được bằng bàn phím
- Multi-select bằng checkbox, `role="menuitemcheckbox"`
- Đóng khi click ra ngoài (`mousedown` / `touchstart`) hoặc nhấn Escape
- Logic lọc: **AND giữa các nhóm, OR trong cùng một nhóm**

Dưới menu là dãy chip điều kiện đang bật, gỡ được từng cái, kèm nút "Xóa lọc".

Phần biết về miền nằm ở `features/rules/constants/rule.constants.ts` (`RULE_FILTER_GROUPS`).

## Dòng quy tắc — `RuleRow`

mã tiêu chí · tên quy tắc · chip phép so sánh + giá trị · chip loại nhà (viết tắt, bề rộng cố định `w-32`) · badge loại kiểm tra A/B/C/D · công tắc áp dụng · menu ba chấm.

Quy tắc đang tắt thì cả dòng mờ đi (`opacity-55`).

Menu ba chấm: Xem chi tiết · Chỉnh sửa · Nhân bản · Xóa.

## Danh sách

Gom theo 5 nhóm CHTK, mỗi nhóm là một card với header: chấm màu + số thứ tự + tên đầy đủ + số lượng.

## Thay đổi vocabulary kéo theo

Bảng rule định nghĩa **4 loại kiểm tra** A–D, trong khi findings trước đó dùng `ReasoningGroup` A/B/C với nghĩa khác cho C. Đã lấy bảng rule làm chuẩn:

- `ReasoningGroup` → `CheckType` (`ReasoningGroup` giữ làm alias)
- `HouseType` đổi từ `apartment|villa|townhouse` sang 5 loại thật
- Thêm `ComparisonOperator`
- Nhãn/màu/thứ tự gom về `shared/constants/domain.ts`
- Thêm token `--group-d` và bộ `--cat-*` cho chấm màu nhóm CHTK

## Hành vi đã kiểm chứng bằng jsdom

67 rule / 5 section. Chọn loại kiểm tra A còn 38; thêm D thành 39 (OR); thêm nhóm CHTK "Mặt ngoài công trình" còn 13 và 1 section (AND) — khớp đếm tay. Click ra ngoài đóng menu. Gỡ chip và "Xóa lọc" trả về 67. Công tắc đổi true→false. Menu ba chấm ra đủ 4 mục.

Hover mở sub-menu **chưa kiểm chứng tự động** — jsdom không dựng được `mouseenter` của React. Code có `onMouseEnter`, cần thử tay trên trình duyệt.

## Còn treo

- Menu thao tác mới `console.log`, chưa có modal/confirm.
- Công tắc lưu trong `useState` cục bộ, chưa gọi API.
- `HouseTypeFilter.tsx` và `ThresholdEditor.tsx` vẫn là stub rỗng — bộ lọc hiện dùng `CascadingFilterMenu` thay cho `HouseTypeFilter`.
- Chưa có tìm kiếm theo từ khóa, chưa phân trang (`shared/components/Pagination.tsx` còn rỗng).
