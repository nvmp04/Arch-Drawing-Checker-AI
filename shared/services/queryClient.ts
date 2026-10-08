import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

import { ApiError } from "./apiClient";

/**
 * Cấu hình TanStack Query dùng chung cho cả dự án.
 *
 * Vì sao phải có hàm khởi tạo riêng chứ không tạo thẳng một `new QueryClient()`
 * ở module scope: trên server, module được dùng lại giữa các request của **mọi
 * người dùng**, nên một client dùng chung sẽ rò dữ liệu người này sang người
 * kia. Mẫu chuẩn cho App Router: server tạo mới mỗi lần, trình duyệt tạo một
 * lần rồi giữ lại (nếu tạo lại thì mỗi lần React Suspense render lại sẽ mất
 * sạch cache).
 */

const ONE_MINUTE = 60 * 1000;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * Khác 0 là bắt buộc khi có SSR: dữ liệu vừa render trên server mà
         * `staleTime: 0` thì client refetch lại ngay lần hydrate đầu tiên.
         */
        staleTime: ONE_MINUTE,
        gcTime: 5 * ONE_MINUTE,
        /** Lỗi 4xx thì thử lại cũng vẫn 4xx — chỉ thử lại lỗi mạng và 5xx. */
        retry: (failureCount, error) => {
          if (error instanceof ApiError && !error.isRetryable) return false;
          return failureCount < 2;
        },
        /**
         * App thẩm định bản vẽ: người dùng rời tab đi đọc tài liệu rồi quay lại
         * liên tục. Tự refetch mỗi lần focus làm danh sách nhảy dưới tay họ.
         * Nơi nào thật sự cần dữ liệu tươi thì tự bật lại tại chỗ.
         */
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
      dehydrate: {
        /**
         * Cho phép dehydrate cả query đang chạy dở, để server streaming gửi
         * trước phần khung rồi bù dữ liệu sau.
         */
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Lấy `QueryClient` đúng theo môi trường. Dùng ở provider và ở chỗ prefetch
 * phía server (nếu sau này cần).
 */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
