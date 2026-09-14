import { TipMeta, TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import type { ReasoningGroup } from "@/shared/constants/enums";
import { GROUP_CONFIG } from "../constants/finding.constants";

/**
 * Nhóm trích xuất A / B / C. Chip trung tính, chỉ điểm màu bằng chấm nhỏ
 * để không cạnh tranh với màu trạng thái.
 */
export function ReasoningGroupTag({ group }: { group: ReasoningGroup }) {
  const { title, method, expectedConfidence, dot } = GROUP_CONFIG[group];

  return (
    <Tooltip
      content={
        <>
          <TipTitle>{title}</TipTitle>
          <TipText>{method}</TipText>
          <TipMeta>
            Độ tin cậy kỳ vọng:{" "}
            <span className="numeric text-text-secondary">{expectedConfidence}</span>
          </TipMeta>
        </>
      }
    >
      <span
        aria-label={title}
        className="inline-flex items-center gap-1 rounded-sm bg-surface-sunken px-1.5 py-0.5 text-xs font-medium text-text-secondary"
      >
        <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
        {group}
      </span>
    </Tooltip>
  );
}
