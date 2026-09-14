import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import type { ChtkCategory } from "@/shared/constants/enums";
import { CATEGORY_CONFIG } from "../constants/finding.constants";

/** Nhóm CHTK — chỉ để phân loại, giữ trung tính về màu. */
export function ChtkCategoryTag({ category }: { category: ChtkCategory }) {
  const { label } = CATEGORY_CONFIG[category];

  return (
    <Tooltip
      content={
        <>
          <TipTitle>Nhóm CHTK — {label}</TipTitle>
          <TipText>
            Nhóm tiêu chuẩn của tiêu chí, suy ra từ chữ số đầu của chỉ mục: 1.x
            Mặt ngoài · 2.x Kích thước · 3.x Thang - Ramp · 4.x Cấu tạo · 5.x
            Hoàn thiện.
          </TipText>
        </>
      }
    >
      <span className="inline-flex items-center whitespace-nowrap rounded-sm border border-border-default px-1.5 py-0.5 text-xs text-text-muted">
        {label}
      </span>
    </Tooltip>
  );
}
