"use client";

import { useEffect, useRef, useState } from "react";

import {
  CopyIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "@/shared/components/icons";

export type RuleAction = "view" | "edit" | "duplicate" | "delete";

const ACTIONS: readonly {
  key: RuleAction;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  danger?: boolean;
}[] = [
  { key: "view", label: "Xem chi tiết", Icon: EyeIcon },
  { key: "edit", label: "Chỉnh sửa", Icon: PencilIcon },
  { key: "duplicate", label: "Nhân bản", Icon: CopyIcon },
  { key: "delete", label: "Xóa", Icon: TrashIcon, danger: true },
];

export function RuleActionMenu({
  ruleCode,
  onAction,
}: {
  ruleCode: string;
  onAction: (action: RuleAction) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Thao tác với tiêu chí ${ruleCode}`}
        className="inline-flex size-8 items-center justify-center rounded-md
                   text-text-muted transition-colors duration-150
                   hover:bg-surface-hover hover:text-text-primary
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
      >
        <MoreHorizontalIcon className="size-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[var(--z-menu)] mt-1 w-44 rounded-lg
                     bg-surface-raised p-1 shadow-ds-menu"
        >
          {ACTIONS.map(({ key, label, Icon, danger }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onAction(key);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm
                          transition-colors duration-150 hover:bg-surface-hover
                          focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus
                          ${danger ? "text-fail-text" : "text-text-secondary hover:text-text-primary"}`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
