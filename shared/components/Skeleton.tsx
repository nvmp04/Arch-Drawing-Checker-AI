/**
 * Khối giữ chỗ trong lúc chờ dữ liệu.
 *
 * Nền `surface-sunken` — cùng token với track và input, nên khối giữ chỗ luôn
 * chìm hơn card chứa nó ở cả hai theme. `motion-reduce:animate-none` là bắt
 * buộc: nhịp nhấp nháy là chuyển động lặp vô hạn.
 *
 * `aria-hidden` vì trình đọc màn hình đã được báo qua `role="status"` của vùng
 * bao ngoài (xem `SkeletonBlock`); đọc lại từng khối xám là nhiễu.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-surface-sunken motion-reduce:animate-none ${className}`}
    />
  );
}

/**
 * Vùng chờ hoàn chỉnh: bọc các `Skeleton` con và báo cho trình đọc màn hình
 * biết đang tải. Mọi màn hình chờ phải đi qua đây, không đặt `Skeleton` trần.
 */
export function SkeletonBlock({
  label = "Đang tải dữ liệu…",
  className = "",
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Mấy dòng chữ giữ chỗ, dòng cuối ngắn hơn cho giống đoạn văn thật. */
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={index === lines - 1 ? "h-3 w-1/2" : "h-3 w-full"}
        />
      ))}
    </div>
  );
}

/** Danh sách dòng giữ chỗ — khuôn dùng lại cho mọi trang danh sách. */
export function SkeletonList({
  rows = 5,
  rowClassName = "h-16",
  label,
}: {
  rows?: number;
  rowClassName?: string;
  label?: string;
}) {
  return (
    <SkeletonBlock label={label}>
      <div className="divide-y divide-border-subtle rounded-lg bg-surface-raised shadow-ds-small">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="p-4">
            <Skeleton className={`w-full ${rowClassName}`} />
          </div>
        ))}
      </div>
    </SkeletonBlock>
  );
}
