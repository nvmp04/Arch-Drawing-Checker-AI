import Link from "next/link";

import {
  AlertTriangleIcon,
  CheckIcon,
  LoaderIcon,
  PageIcon,
} from "@/shared/components/icons";
import {
  StatusStackedBar,
  totalOf,
} from "@/shared/components/StatusStackedBar";
import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import {
  ACTION_REQUIRED_STATUSES,
  HOUSE_TYPE_CONFIG,
  PASSED_STATUSES,
} from "@/shared/constants/domain";
import type { Review } from "../types/review.types";

/** Màu của con số tỷ lệ phụ thuộc chính giá trị đó. */
function passRateTone(percent: number): string {
  if (percent < 50) return "text-fail-text";
  if (percent < 80) return "text-warning-text";
  return "text-pass-text";
}

const PROCESSING_CONFIG = {
  running: {
    label: "Đang xử lý",
    Icon: LoaderIcon,
    className: "text-pending animate-spin",
  },
  failed: {
    label: "Lỗi xử lý",
    Icon: AlertTriangleIcon,
    className: "text-fail",
  },
  idle: { label: "Hoàn tất", Icon: CheckIcon, className: "text-pass" },
} as const;

export function ReviewListItem({
  review,
  workspaceSlug,
}: {
  review: Review;
  workspaceSlug: string;
}) {
  const isRunning = review.processingState === "running";
  const isFailed = review.processingState === "failed";
  const isDone = !isRunning && !isFailed;

  const state = isRunning ? "running" : isFailed ? "failed" : "idle";
  const { label: stateLabel, Icon: StateIcon, className: stateClass } =
    PROCESSING_CONFIG[state];

  const total = totalOf(review.statusCounts);
  const concluded = total - review.statusCounts.unknown;
  const passed = PASSED_STATUSES.reduce(
    (sum, s) => sum + review.statusCounts[s],
    0,
  );
  const passRate = concluded > 0 ? Math.round((passed / concluded) * 100) : 0;
  const actionRequired = ACTION_REQUIRED_STATUSES.reduce(
    (sum, s) => sum + review.statusCounts[s],
    0,
  );

  return (
    <Link
      href={`/${workspaceSlug}/reviews/${review.id}`}
      className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3
                 transition-colors duration-150 hover:bg-surface-hover
                 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus"
    >
      <Tooltip
        content={
          <>
            <TipTitle>{stateLabel}</TipTitle>
            <TipText>
              {isRunning
                ? `AI đã phân tích ${review.progressPercent ?? 0}% số trang.`
                : isFailed
                  ? "Không đọc được file PDF. Cần tải lại hồ sơ."
                  : "Đã đối chiếu xong toàn bộ tiêu chí."}
            </TipText>
          </>
        }
      >
        <StateIcon className={`size-4 shrink-0 ${stateClass}`} />
      </Tooltip>

      <span className="min-w-0 flex-1 basis-56">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="numeric shrink-0 text-sm font-medium text-text-primary">
            {review.code}
          </span>
          <span className="min-w-0 truncate text-sm text-text-secondary">
            {review.name}
          </span>
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <PageIcon className="size-3.5 shrink-0" />
            <span className="numeric">{review.pageCount}</span> trang
          </span>
          <span>{review.zoneName}</span>
          <span>{HOUSE_TYPE_CONFIG[review.houseType].label}</span>
        </span>
      </span>

      <span className="flex min-w-0 flex-1 basis-56 flex-col gap-1.5">
        {isDone ? (
          <StatusStackedBar counts={review.statusCounts} />
        ) : (
          <span
            className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
            role="img"
            aria-label={
              isRunning
                ? `AI đang phân tích, ${review.progressPercent ?? 0}%`
                : "Lỗi xử lý"
            }
          >
            <span
              className={`block h-full rounded-full ${isFailed ? "bg-fail" : "bg-pending"}`}
              style={{ width: isFailed ? "100%" : `${review.progressPercent ?? 0}%` }}
            />
          </span>
        )}

        <span className="text-xs">
          {isDone ? (
            actionRequired > 0 ? (
              <span className="text-fail-text">
                <span className="numeric">{actionRequired}</span> cần xử lý
              </span>
            ) : (
              <span className="text-text-muted">Không còn mục cần xử lý</span>
            )
          ) : isFailed ? (
            <span className="text-fail-text">Lỗi xử lý</span>
          ) : (
            <span className="text-text-muted">
              AI đang phân tích ·{" "}
              <span className="numeric">{review.progressPercent ?? 0}%</span>
            </span>
          )}
        </span>
      </span>

      <span className="w-14 shrink-0 text-right">
        {isDone ? (
          <span className={`numeric text-sm font-medium ${passRateTone(passRate)}`}>
            {passRate}%
          </span>
        ) : (
          <span className="text-sm text-text-muted" aria-label="Chưa có tỷ lệ">
            ——
          </span>
        )}
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <span className="numeric whitespace-nowrap text-xs text-text-muted">
          {review.updatedAt}
        </span>
        <Tooltip
          align="right"
          content={<TipTitle>Phụ trách: {review.assignee.name}</TipTitle>}
        >
          <span
            className="inline-flex size-7 items-center justify-center rounded-full
                       bg-surface-sunken text-xs font-medium text-text-secondary"
            aria-label={`Phụ trách: ${review.assignee.name}`}
          >
            {review.assignee.initials}
          </span>
        </Tooltip>
      </span>
    </Link>
  );
}
