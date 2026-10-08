"use client";

import { useEffect, useState } from "react";

/**
 * Trả về `value` sau khi nó đã ngừng thay đổi trong `delayMs`.
 *
 * Dùng cho ô tìm kiếm và bộ lọc gõ tay: giá trị trong input cập nhật tức thì
 * (state riêng của input), còn giá trị dùng để lọc / làm `queryKey` thì chờ
 * người dùng gõ xong — tránh mỗi phím một lời gọi API.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
