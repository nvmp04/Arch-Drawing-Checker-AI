"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { getQueryClient } from "@/shared/services/queryClient";

/**
 * Các provider ở gốc cây React. Đặt trong `app/` vì đây là phần nối dây của
 * ứng dụng, không phải component tái dụng được.
 *
 * `getQueryClient()` chứ không phải `useState(() => new QueryClient())`: hàm đó
 * đã lo sẵn việc server tạo mới mỗi request còn trình duyệt giữ lại một bản —
 * xem `shared/services/queryClient.ts`.
 *
 * Devtools là devDependency, bản build production của nó export một component
 * rỗng nên không ảnh hưởng bundle thật; vẫn bọc thêm điều kiện để chắc chắn.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
