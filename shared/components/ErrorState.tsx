"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "./icons";

/**
 * Trạng thái lỗi của một vùng dữ liệu — cặp đôi với `EmptyState`.
 *
 * Ba thứ bắt buộc, theo đúng ràng buộc của dự án:
 * - **Icon + chữ**, không chỉ màu (D-05);
 * - **nói được phải làm gì tiếp**, nên luôn có nút thử lại khi nơi gọi truyền
 *   `onRetry` (với TanStack Query thì truyền thẳng `refetch`);
 * - **không đổ lỗi cho người dùng** và không phô thông báo kỹ thuật thô — chi
 *   tiết kỹ thuật để trong `detail`, hiển thị nhỏ và mờ.
 */
export function ErrorState({
  message = "Không tải được dữ liệu.",
  detail,
  onRetry,
}: {
  message?: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg bg-surface-raised px-4 py-10 text-center shadow-ds-small"
    >
      <span className="inline-flex size-9 items-center justify-center rounded-md bg-fail-subtle text-fail-text">
        <AlertTriangleIcon className="size-5" />
      </span>

      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">{message}</p>
        {detail && <p className="text-xs text-text-muted">{detail}</p>}
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border-default bg-surface-raised px-3 text-sm font-medium text-text-primary
                     transition-colors duration-150 hover:bg-surface-hover hover:border-border-strong
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <RefreshCwIcon className="size-4" />
          Thử lại
        </button>
      )}
    </div>
  );
}

/** Lấy câu mô tả ngắn từ một lỗi bất kỳ, để truyền vào `detail`. */
export function errorDetail(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  return undefined;
}
