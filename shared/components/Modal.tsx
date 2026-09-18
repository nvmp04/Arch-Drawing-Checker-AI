"use client";

import { useEffect } from "react";

import { XIcon } from "./icons";

/**
 * Khung dialog dùng chung: lớp phủ mờ + panel giữa màn hình, đóng bằng Escape
 * hoặc click ra ngoài panel. Không biết gì về miền bài toán — nội dung form do
 * bên gọi truyền vào qua `children`.
 */
export function Modal({
  title,
  onClose,
  children,
  widthClassName = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-overlay p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90vh] w-full ${widthClassName} flex-col rounded-xl bg-surface-raised shadow-ds-modal`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
          <h2 className="text-sm font-medium text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="inline-flex size-8 items-center justify-center rounded-md text-text-muted
                       transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
