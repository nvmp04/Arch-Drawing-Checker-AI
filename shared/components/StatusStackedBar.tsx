import { STATUS_CONFIG, STATUS_ORDER } from "@/shared/constants/domain";
import type { FindingStatus } from "@/shared/constants/enums";

export type StatusCounts = Readonly<Record<FindingStatus, number>>;

export const EMPTY_STATUS_COUNTS: StatusCounts = {
  fail: 0,
  warning: 0,
  pending: 0,
  pass: 0,
  approved: 0,
  unknown: 0,
};

export function totalOf(counts: StatusCounts): number {
  return STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);
}

/**
 * Thanh phân rã theo trạng thái.
 *
 * Có khe hở 2px giữa các đoạn để đoạn cạnh nhau không dính thành một mảng màu —
 * bắt buộc, vì chỉ riêng màu thì không đủ phân biệt. Số lượng từng trạng thái
 * luôn có ở hàng chú thích bên dưới hoặc trong tooltip, không bao giờ chỉ dựa
 * vào màu.
 */
export function StatusStackedBar({
  counts,
  className,
  height = "h-2",
}: {
  counts: StatusCounts;
  className?: string;
  height?: string;
}) {
  const total = totalOf(counts);
  const segments = STATUS_ORDER.filter((status) => counts[status] > 0);

  if (total === 0) {
    return (
      <div
        className={`${height} w-full rounded-full bg-surface-sunken ${className ?? ""}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`flex ${height} w-full gap-[2px] overflow-hidden rounded-full bg-surface-sunken ${className ?? ""}`}
      role="img"
      aria-label={segments
        .map((s) => `${STATUS_CONFIG[s].label}: ${counts[s]}`)
        .join(", ")}
    >
      {segments.map((status) => (
        <span
          key={status}
          className={`${STATUS_CONFIG[status].bar} first:rounded-l-full last:rounded-r-full`}
          style={{ width: `${(counts[status] / total) * 100}%` }}
          title={`${STATUS_CONFIG[status].label}: ${counts[status]}`}
        />
      ))}
    </div>
  );
}

/** Hàng chú thích: chấm màu + nhãn chữ + số lượng, đủ 6 trạng thái. */
export function StatusLegend({ counts }: { counts: StatusCounts }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {STATUS_ORDER.map((status) => (
        <li key={status} className="inline-flex items-center gap-1.5 text-xs">
          <span
            className={`size-1.5 shrink-0 rounded-full ${STATUS_CONFIG[status].bar}`}
            aria-hidden
          />
          <span className="text-text-muted">{STATUS_CONFIG[status].label}</span>
          <span className="numeric text-text-secondary">{counts[status]}</span>
        </li>
      ))}
    </ul>
  );
}
