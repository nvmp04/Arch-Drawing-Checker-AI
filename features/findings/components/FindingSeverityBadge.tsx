import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import type { FindingSeverity } from "@/shared/constants/enums";
import {
  SEVERITY_CONFIG,
  SEVERITY_DESCRIPTION,
} from "../constants/finding.constants";

/**
 * Mức độ dùng thang cường độ một sắc (xám → hổ phách → đỏ → đỏ đậm),
 * kèm thanh dọc để đọc được cả khi không phân biệt màu.
 */
export function FindingSeverityBadge({ severity }: { severity: FindingSeverity }) {
  const { label, badge, bar } = SEVERITY_CONFIG[severity];

  return (
    <Tooltip
      content={
        <>
          <TipTitle>Mức độ — {label}</TipTitle>
          <TipText>{SEVERITY_DESCRIPTION[severity]}</TipText>
          <TipText>Thang tăng dần: Thấp · Trung bình · Cao · Nghiêm trọng.</TipText>
        </>
      }
    >
      <span
        className={`inline-flex items-center gap-1.5 rounded-sm py-0.5 pl-1.5 pr-2 text-xs font-medium ${badge}`}
      >
        <span className={`h-3 w-0.5 shrink-0 rounded-full ${bar}`} aria-hidden />
        {label}
      </span>
    </Tooltip>
  );
}
