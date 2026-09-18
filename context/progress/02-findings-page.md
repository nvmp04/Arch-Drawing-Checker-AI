# Giai đoạn 02 — Trang Kết quả tiêu chí (findings)

Route: `/[slug]/findings` và `/[slug]/zones/[zoneId]/findings`.

## Cấu trúc cuối cùng

Cây ba cấp, mỗi cấp thu gọn được và thụt sâu hơn cấp cha:

```
Hồ sơ thẩm định  PN2-DN-01 · Bản vẽ mẫu PN2 Đà Nẵng — Shophouse điển hình
  └── Nhóm trạng thái  ● Không đạt  21          (đủ 6 nhóm, kể cả nhóm rỗng)
        └── Dòng tiêu chí × N                    (đường dọc mang màu trạng thái)
```

Header hồ sơ khi thu gọn vẫn cho quét nhanh: dãy chấm màu kèm số lượng theo trạng thái, tổng số tiêu chí, số không đạt tô đỏ.

## Dòng tiêu chí — thứ tự trái sang phải

mức độ · mã tiêu chí · loại chi tiết · vi phạm/tiêu chuẩn · độ tin cậy · loại kiểm tra · nhóm CHTK · trang PDF · trạng thái · chevron.

Không có hàng nhãn cột. Mỗi phần tử tự giải thích bằng khung chú thích khi hover (`shared/components/Tooltip.tsx`).

Màu trong một dòng: giá trị trích xuất đỏ khi `fail`, hổ phách khi `warning`, xám nghiêng khi `unknown`; giá trị tiêu chuẩn luôn xám.

Cả dòng là link tới `/[slug]/reviews/[reviewId]`.

## File

| File | Vai trò |
|---|---|
| `components/FindingList.tsx` | client, giữ state lọc + đóng mở, gom nhóm, sắp xếp |
| `components/ReviewDossierSection.tsx` | cấp 1 — hồ sơ thẩm định |
| `components/StatusGroupSection.tsx` | cấp 2 — nhóm trạng thái |
| `components/FindingRow.tsx` | cấp 3 — một tiêu chí |
| `components/{FindingSeverityBadge,FindingStatusBadge,ConfidenceBadge,ReasoningGroupTag,ChtkCategoryTag,PageReferenceLink,ExtractedVsExpectedValue}.tsx` | các phần tử trong dòng |
| `components/FindingStatusFilterBar.tsx` | chip lọc theo trạng thái kèm số đếm |
| `mocks/findings.mock.ts` | 1 hồ sơ, 66 finding |

## Hành vi đã kiểm chứng bằng jsdom

33 dòng lúc mở trang (3 nhóm mở sẵn) → thu gọn hồ sơ còn 0 → mở lại 33 → thu gọn nhóm Không đạt còn 12 → "Mở rộng tất cả" ra 66 → "Thu gọn tất cả" về 0.

## Còn treo

- Chưa lọc theo `zoneId` ở nhánh zone.
- Chưa có `FindingDetailPanelContainer` (panel chi tiết bên phải).
- Trang `/reviews/[reviewId]` mà dòng tiêu chí trỏ tới vẫn là vỏ rỗng. Thiết kế dự kiến: hiển thị PDF có khoanh vùng tiêu chí, liên kết hai chiều giữa vùng khoanh và dòng trong danh sách.

## Đã đổi giữa chừng

Bản đầu gom theo **bản vẽ** với tên tự bịa ("Mặt đứng chính & mặt đứng bên"). Sai — cấp gom nhóm đúng là **hồ sơ thẩm định**, tên theo dạng `PN2-DN-01 Bản vẽ mẫu PN2 Đà Nẵng — Shophouse điển hình`. `DrawingGroupSection.tsx` là tàn dư của bản đó, nên xóa.
