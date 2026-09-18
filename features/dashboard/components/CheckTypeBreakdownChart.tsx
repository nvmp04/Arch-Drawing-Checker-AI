import {
  StatusLegend,
  StatusStackedBar,
  type StatusCounts,
} from "@/shared/components/StatusStackedBar";
import { TipMeta, TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import { CHECK_TYPE_CONFIG } from "@/shared/constants/domain";
import type { CheckTypeBreakdown } from "../types/dashboard.types";

/**
 * Kết luận phân rã theo 4 loại kiểm tra.
 *
 * Mỗi dòng là một thanh stacked 6 trạng thái. Màu không bao giờ đứng một mình:
 * hàng chú thích cuối khối liệt kê đủ 6 trạng thái kèm số lượng.
 */
export function CheckTypeBreakdownChart({
  rows,
  statusTotals,
}: {
  rows: readonly CheckTypeBreakdown[];
  statusTotals: StatusCounts;
}) {
  return (
    <div className="space-y-4">
      <ul className="space-y-3.5">
        {rows.map((row) => {
          const config = CHECK_TYPE_CONFIG[row.checkType];

          return (
            <li key={row.checkType}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Tooltip
                    content={
                      <>
                        <TipTitle>{config.title}</TipTitle>
                        <TipText>{config.method}</TipText>
                        <TipMeta>
                          Độ tin cậy kỳ vọng:{" "}
                          <span className="numeric text-text-secondary">
                            {config.expectedConfidence}
                          </span>
                        </TipMeta>
                      </>
                    }
                  >
                    <span
                      className={`inline-flex size-5 items-center justify-center rounded-sm text-xs font-medium ${config.badge}`}
                    >
                      {row.checkType}
                    </span>
                  </Tooltip>
                  <span className="truncate text-sm text-text-secondary">
                    {config.label}
                  </span>
                </span>

                <span className="flex shrink-0 items-baseline gap-2 text-xs text-text-muted">
                  <span className="numeric">{row.total}</span> tiêu chí
                  <span aria-hidden>·</span>
                  <span className="numeric">{config.expectedConfidence}</span>
                </span>
              </div>

              <StatusStackedBar counts={row.counts} className="mt-1.5" />
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border-subtle pt-3">
        <StatusLegend counts={statusTotals} />
      </div>
    </div>
  );
}
