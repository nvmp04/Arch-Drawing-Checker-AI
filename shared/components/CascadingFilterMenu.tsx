"use client";

import { useEffect, useId, useRef, useState } from "react";

import { CheckIcon, ChevronRightIcon, FilterIcon } from "@/shared/components/icons";

export type FilterOption = {
  /** Giá trị lưu trong state — không hiển thị. */
  value: string;
  /** Nhãn hiển thị ở menu cấp 2. */
  label: string;
  /** Tiền tố ngắn đứng trước nhãn, ví dụ "1." hoặc "A." */
  prefix?: string;
  /** Class tô màu cho chấm đứng đầu dòng, nếu nhóm có màu. */
  dot?: string;
};

export type FilterGroup = {
  /** Khóa nhóm — trùng với khóa trong state của bên gọi. */
  key: string;
  /** Nhãn ở menu cấp 1. */
  label: string;
  options: readonly FilterOption[];
};

/**
 * Menu lọc đa cấp. Cấp 1 là danh sách nhóm thuộc tính, trỏ vào một nhóm thì
 * cấp 2 mở ra bên phải với danh sách giá trị chọn nhiều.
 *
 * Component này không biết gì về miền bài toán — nhóm, giá trị và state đều
 * do bên gọi truyền vào.
 */
export function CascadingFilterMenu({
  groups,
  selected,
  onChange,
  onClear,
  triggerLabel = "Bộ lọc",
}: {
  groups: readonly FilterGroup[];
  /** Giá trị đang chọn theo từng nhóm. */
  selected: Readonly<Record<string, readonly string[]>>;
  /** Gọi lại với state đã cập nhật mỗi lần chọn / bỏ chọn. */
  onChange: (next: Record<string, readonly string[]>) => void;
  onClear: () => void;
  triggerLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const totalSelected = Object.values(selected).reduce(
    (sum, values) => sum + values.length,
    0,
  );

  // Đóng khi click ra ngoài hoặc nhấn Escape.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveGroup(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setActiveGroup(null);
      }
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

  const toggleValue = (groupKey: string, value: string) => {
    const current = selected[groupKey] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...selected, [groupKey]: next });
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => !open);
          setActiveGroup(null);
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        data-active={isOpen || totalSelected > 0}
        className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm
                   text-text-secondary shadow-ds-border transition-colors duration-150
                   hover:bg-surface-hover hover:text-text-primary
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                   data-[active=true]:bg-surface-active data-[active=true]:text-text-primary"
      >
        <FilterIcon className="size-4" />
        {triggerLabel}
        {totalSelected > 0 && (
          <span className="numeric rounded-sm bg-accent px-1.5 py-0.5 text-xs font-medium text-text-on-accent">
            {totalSelected}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-[var(--z-menu)] mt-1 w-64 rounded-lg
                     bg-surface-raised p-1 shadow-ds-menu"
        >
          {groups.map((group) => {
            const count = (selected[group.key] ?? []).length;
            const isActive = activeGroup === group.key;

            return (
              <div
                key={group.key}
                className="relative"
                onMouseEnter={() => setActiveGroup(group.key)}
              >
                <button
                  type="button"
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded={isActive}
                  onClick={() => setActiveGroup(isActive ? null : group.key)}
                  onFocus={() => setActiveGroup(group.key)}
                  data-active={isActive}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm
                             text-text-secondary transition-colors duration-150
                             hover:bg-surface-hover hover:text-text-primary
                             focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus
                             data-[active=true]:bg-surface-hover data-[active=true]:text-text-primary"
                >
                  <span className="flex-1 truncate">{group.label}</span>
                  {count > 0 && (
                    <span className="numeric text-xs text-accent-text">{count}</span>
                  )}
                  <ChevronRightIcon className="size-4 shrink-0 text-text-muted" />
                </button>

                {isActive && (
                  <div
                    role="menu"
                    className="absolute left-full top-0 z-[var(--z-menu)] ml-1 w-72 rounded-lg
                               bg-surface-raised p-1 shadow-ds-menu"
                  >
                    {group.options.map((option) => {
                      const isChecked = (selected[group.key] ?? []).includes(
                        option.value,
                      );
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="menuitemcheckbox"
                          aria-checked={isChecked}
                          onClick={() => toggleValue(group.key, option.value)}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm
                                     text-text-secondary transition-colors duration-150
                                     hover:bg-surface-hover hover:text-text-primary
                                     focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus"
                        >
                          <span
                            data-checked={isChecked}
                            className="flex size-4 shrink-0 items-center justify-center rounded-sm
                                       border border-border-strong
                                       data-[checked=true]:border-accent data-[checked=true]:bg-accent
                                       data-[checked=true]:text-text-on-accent"
                          >
                            {isChecked && <CheckIcon className="size-3" />}
                          </span>
                          {option.dot && (
                            <span
                              className={`size-1.5 shrink-0 rounded-full ${option.dot}`}
                              aria-hidden
                            />
                          )}
                          {option.prefix && (
                            <span className="numeric shrink-0 text-text-muted">
                              {option.prefix}
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {totalSelected > 0 && (
            <>
              <div className="my-1 h-px bg-border-subtle" />
              <button
                type="button"
                role="menuitem"
                onClick={onClear}
                className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm
                           text-text-muted transition-colors duration-150
                           hover:bg-surface-hover hover:text-text-primary
                           focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus"
              >
                Xóa toàn bộ bộ lọc
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
