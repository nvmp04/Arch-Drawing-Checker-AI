"use client";

/** Công tắc bật/tắt. Có nhãn ẩn để đọc màn hình biết đang bật hay tắt cái gì. */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={checked ? "Đang áp dụng — bấm để tạm ngưng" : "Đang tạm ngưng — bấm để áp dụng"}
      onClick={() => onChange(!checked)}
      data-checked={checked}
      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
                 bg-surface-sunken shadow-ds-border transition-colors duration-150
                 data-[checked=true]:bg-accent
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
    >
      <span
        data-checked={checked}
        className="ml-0.5 size-4 rounded-full bg-ds-background-100 transition-transform duration-150
                   data-[checked=true]:translate-x-4"
      />
    </button>
  );
}
