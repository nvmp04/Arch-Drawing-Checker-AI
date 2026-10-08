"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Theo dõi một media query, ví dụ `useMediaQuery("(max-width: 1023px)")`.
 *
 * Dùng `useSyncExternalStore` thay cho `useState` + `useEffect`: snapshot phía
 * server luôn là `false`, nên HTML dựng trên server và lần render đầu ở client
 * khớp nhau — không có nhấp nháy bố cục và không có cảnh báo hydration. React
 * tự đọc lại giá trị thật ngay sau khi gắn vào DOM.
 *
 * Hệ quả cần biết: **lần render đầu ở client luôn trả `false`**. Nhánh ứng với
 * `true` (drawer cho màn hẹp chẳng hạn) phải là nhánh phụ, không phải nhánh
 * mặc định.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
