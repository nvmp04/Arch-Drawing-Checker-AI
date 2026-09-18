import { CHECK_TYPE_CONFIG, CHECK_TYPE_ORDER } from "@/shared/constants/domain";
import type { ReviewCheckTypeBreakdown } from "../types/review.types";

/** Thanh ngang thể hiện số phần tử AI đã phân tích được, theo từng loại kiểm tra. */
export function CheckTypeBreakdownBars({
  rows,
}: {
  rows: readonly ReviewCheckTypeBreakdown[];
}) {
  const countByType = new Map(rows.map((row) => [row.checkType, row.count]));
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <ul className="space-y-3">
      {CHECK_TYPE_ORDER.map((checkType) => {
        const config = CHECK_TYPE_CONFIG[checkType];
        const count = countByType.get(checkType) ?? 0;

        return (
          <li key={checkType}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-sm text-xs font-medium ${config.badge}`}
                >
                  {checkType}
                </span>
                {config.label}
              </span>
              <span className="numeric text-sm font-medium text-text-primary">
                {count}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
              <span
                className={`block h-full rounded-full ${config.dot}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
