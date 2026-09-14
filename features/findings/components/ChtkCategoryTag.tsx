import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import { CATEGORY_CONFIG } from "@/shared/constants/domain";
import type { ChtkCategory } from "@/shared/constants/enums";

/**
 * Nhóm CHTK. Dòng tiêu chí đã dày nên ở đây dùng tên rút gọn kèm chấm nhận
 * diện; tên đầy đủ nằm trong khung chú thích.
 */
export function ChtkCategoryTag({ category }: { category: ChtkCategory }) {
  const { label, short, dot } = CATEGORY_CONFIG[category];

  return (
    <Tooltip
      content={
        <>
          <TipTitle>Nhóm CHTK — {label}</TipTitle>
          <TipText>
            Suy ra từ chữ số đầu của mã tiêu chí: 1.x Mặt ngoài công trình · 2.x
            Kích thước công trình · 3.x Thang bộ – Ramp hầm · 4.x Chi tiết cấu
            tạo điển hình · 5.x Chi tiết hoàn thiện điển hình.
          </TipText>
        </>
      }
    >
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-border-default px-1.5 py-0.5 text-xs text-text-muted">
        <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
        {short}
      </span>
    </Tooltip>
  );
}
