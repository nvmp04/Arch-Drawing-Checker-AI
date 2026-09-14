import type { FindingStatus } from "@/shared/constants/enums";
import { STATUS_CONFIG, STATUS_ORDER } from "../constants/finding.constants";

export type StatusFilter = FindingStatus | "all";

export function FindingStatusFilterBar({
  counts,
  total,
  active,
  onChange,
}: {
  counts: Record<FindingStatus, number>;
  total: number;
  active: StatusFilter;
  onChange: (next: StatusFilter) => void;
}) {
  const chip =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm " +
    "transition-colors duration-150 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus " +
    "text-text-secondary hover:bg-surface-hover hover:text-text-primary " +
    "data-[active=true]:bg-surface-active data-[active=true]:font-medium data-[active=true]:text-text-primary";

  return (
    <div
      role="tablist"
      aria-label="Lọc theo trạng thái tiêu chí"
      className="flex flex-wrap items-center gap-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === "all"}
        data-active={active === "all"}
        onClick={() => onChange("all")}
        className={chip}
      >
        Tất cả
        <span className="numeric text-xs text-text-muted">{total}</span>
      </button>

      {STATUS_ORDER.map((status) => {
        const { label, Icon, bar } = STATUS_CONFIG[status];
        return (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={active === status}
            data-active={active === status}
            onClick={() => onChange(status)}
            className={chip}
          >
            <span className={`size-1.5 shrink-0 rounded-full ${bar}`} aria-hidden />
            <Icon className="size-3.5 shrink-0" />
            {label}
            <span className="numeric text-xs text-text-muted">{counts[status]}</span>
          </button>
        );
      })}
    </div>
  );
}
