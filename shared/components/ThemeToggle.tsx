"use client";

import { useEffect, useState } from "react";

import { MoonIcon, SunIcon } from "@/shared/components/icons";

const STORAGE_KEY = "adc-theme";

/**
 * Theme mặc định của app là dark (class `dark` đặt sẵn trên <html> ở app/layout.tsx).
 * Toggle này chỉ bật/tắt class đó và ghi nhớ lựa chọn.
 * Khi dự án cài next-themes thì thay bằng useTheme(), giữ nguyên phần hiển thị.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const shouldBeDark = stored ? stored === "dark" : true;
    document.documentElement.classList.toggle("dark", shouldBeDark);
    setIsDark(shouldBeDark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={isDark ? "Giao diện sáng" : "Giao diện tối"}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md
                 text-text-secondary transition-colors duration-150
                 hover:bg-surface-hover hover:text-text-primary
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
    >
      {/* Trước khi mount, giữ icon mặc định để không lệch hydration */}
      {mounted && !isDark ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
    </button>
  );
}
