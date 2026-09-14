import { TipMeta, TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import type { ReasoningGroup } from "@/shared/constants/enums";
import {
  CONFIDENCE_THRESHOLD,
  GROUP_CONFIG,
} from "../constants/finding.constants";

/**
 * Độ tin cậy cố tình KHÔNG dùng thang xanh–đỏ để không cạnh tranh
 * thị giác với trạng thái tiêu chí. Chỉ dưới ngưỡng mới đổi sang hổ phách.
 */
export function ConfidenceBadge({
  value,
  group,
}: {
  value: number;
  group?: ReasoningGroup;
}) {
  const isLow = value < CONFIDENCE_THRESHOLD;
  const expected = group ? GROUP_CONFIG[group].expectedConfidence : undefined;

  return (
    <Tooltip
      content={
        <>
          <TipTitle>Độ tin cậy của phép trích xuất</TipTitle>
          <TipText>
            {isLow
              ? `Dưới ngưỡng ${Math.round(CONFIDENCE_THRESHOLD * 100)}% — kết luận của máy cần người thẩm định xác nhận.`
              : `Trên ngưỡng ${Math.round(CONFIDENCE_THRESHOLD * 100)}% — kết luận của máy đủ tin cậy để dùng trực tiếp.`}
          </TipText>
          {expected && (
            <TipMeta>
              Kỳ vọng của nhóm {group}:{" "}
              <span className="numeric text-text-secondary">{expected}</span>
            </TipMeta>
          )}
        </>
      }
    >
      <span
        className={`numeric text-xs tabular-nums ${
          isLow ? "text-confidence-low" : "text-confidence-high"
        }`}
      >
        {Math.round(value * 100)}%
      </span>
    </Tooltip>
  );
}
