import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import { CATEGORY_CONFIG } from "@/shared/constants/domain";
import type { GroupPassRate } from "../types/dashboard.types";

/**
 * Tỷ lệ đạt theo 5 nhóm CHTK.
 *
 * Thanh chỉ mang một đại lượng (phần trăm đạt) nên dùng một màu duy nhất —
 * không tô màu theo thứ hạng. Số liệu luôn hiện thành chữ bên cạnh, thanh chỉ
 * là phần đọc nhanh.
 */
export function GroupPassRateChart({ rows }: { rows: readonly GroupPassRate[] }) {
  return (
    <ul className="space-y-3.5">
      {rows.map((row) => {
        const { label, short, dot } = CATEGORY_CONFIG[row.category];
        const hasData = row.concluded > 0;

        return (
          <li key={row.category}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
                <span className="truncate text-sm text-text-secondary">{label}</span>
              </span>

              <span className="flex shrink-0 items-baseline gap-2">
                <span className="numeric text-sm font-medium text-text-primary">
                  {hasData ? `${row.percent}%` : "——"}
                </span>
                <span className="numeric text-xs text-text-muted">
                  {row.passed}/{row.concluded}
                </span>

                {row.missing > 0 && (
                  <Tooltip
                    align="right"
                    content={
                      <>
                        <TipTitle>Thiếu dữ liệu — {short}</TipTitle>
                        <TipText>
                          {row.missing} tiêu chí không tìm thấy thông tin trên bản
                          vẽ nên không đưa vào mẫu số khi tính tỷ lệ đạt.
                        </TipText>
                      </>
                    }
                  >
                    <span className="inline-flex items-center gap-0.5 rounded-sm bg-unknown-subtle px-1.5 py-0.5 text-xs text-unknown-text">
                      ?<span className="numeric">{row.missing}</span>
                    </span>
                  </Tooltip>
                )}
              </span>
            </div>

            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full bg-pass transition-[width] duration-300"
                style={{ width: `${hasData ? row.percent : 0}%` }}
                role="img"
                aria-label={`${label}: đạt ${row.passed} trên ${row.concluded} tiêu chí đã kết luận`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
