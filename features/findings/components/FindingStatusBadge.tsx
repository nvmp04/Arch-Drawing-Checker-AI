import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import type { FindingStatus } from "@/shared/constants/enums";
import { STATUS_CONFIG } from "../constants/finding.constants";

export function FindingStatusBadge({
  status,
  align = "right",
}: {
  status: FindingStatus;
  align?: "left" | "right";
}) {
  const { label, Icon, badge, description } = STATUS_CONFIG[status];

  return (
    <Tooltip
      align={align}
      content={
        <>
          <TipTitle>Trạng thái — {label}</TipTitle>
          <TipText>{description}</TipText>
        </>
      }
    >
      <span
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-medium ${badge}`}
      >
        <Icon className="size-3 shrink-0" />
        {label}
      </span>
    </Tooltip>
  );
}
