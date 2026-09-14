/**
 * Khung chú thích hiện khi hover. Thay cho hàng nhãn cột của bảng:
 * mỗi phần tử tự giải thích nó là gì.
 *
 * Không đặt tabIndex lên phần tử kích hoạt vì tooltip thường nằm bên trong
 * một <Link> — lồng phần tử focus được vào link sẽ hỏng điều hướng bàn phím.
 * Thông tin thiết yếu vẫn phải có trong aria-label của chính dòng.
 */
export function Tooltip({
  content,
  align = "left",
  className,
  children,
}: {
  content: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`group/tip relative inline-flex ${className ?? ""}`}>
      {children}

      <span
        role="tooltip"
        className={`pointer-events-none invisible absolute bottom-full z-[var(--z-tooltip)]
                    mb-2 w-max min-w-40 max-w-72 rounded-lg bg-surface-raised p-3 text-left
                    opacity-0 shadow-ds-menu transition-opacity duration-200
                    group-hover/tip:visible group-hover/tip:opacity-100
                    ${align === "right" ? "right-0" : "left-0"}`}
      >
        {content}
      </span>
    </span>
  );
}

export function TipTitle({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs font-medium text-text-primary">{children}</span>;
}

export function TipText({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1.5 block text-xs leading-relaxed text-text-secondary">
      {children}
    </span>
  );
}

export function TipMeta({ children }: { children: React.ReactNode }) {
  return <span className="mt-1.5 block text-xs text-text-muted">{children}</span>;
}
