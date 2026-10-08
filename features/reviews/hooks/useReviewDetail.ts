"use client";

import { useQueries } from "@tanstack/react-query";

import { reviewKeys } from "../constants/review.queryKeys";
import { reviewsService } from "../services/reviews.service";

/**
 * Hồ sơ thẩm định + tiêu chí của nó, cho trang `/[slug]/reviews/[reviewId]`.
 *
 * Dùng `useQueries` chứ không phải hai `useQuery` nối tiếp: hai lời gọi độc
 * lập nhau nên chạy song song, và cache được tách riêng — quay lại trang sau
 * khi chỉ hồ sơ đổi thì phần tiêu chí không phải tải lại.
 *
 * Trả về một object đã gộp trạng thái, để container chỉ phải đọc một chỗ.
 */
export function useReviewDetail(workspaceSlug: string, reviewId: string) {
  const [reviewQuery, findingsQuery] = useQueries({
    queries: [
      {
        queryKey: reviewKeys.detail(reviewId),
        /**
         * `?? null` là bắt buộc, không phải cho đẹp: TanStack Query **cấm**
         * `queryFn` trả `undefined` (nó dùng `undefined` để đánh dấu "chưa có
         * dữ liệu"), và sẽ biến lời gọi thành lỗi. Không có `?? null` thì hồ sơ
         * không tồn tại hiện ra khung lỗi thay vì khung "không tìm thấy".
         */
        queryFn: async () =>
          (await reviewsService.getReview(workspaceSlug, reviewId)) ?? null,
      },
      {
        queryKey: reviewKeys.findings(reviewId),
        queryFn: () => reviewsService.listReviewFindings(reviewId),
      },
    ],
  });

  return {
    /** `null` nghĩa là đã tra xong và không có hồ sơ nào mang mã này. */
    review: reviewQuery.data ?? undefined,
    findings: findingsQuery.data ?? [],
    /** Còn thiếu một trong hai nhánh thì chưa dựng được khung xem. */
    isPending: reviewQuery.isPending || findingsQuery.isPending,
    isError: reviewQuery.isError || findingsQuery.isError,
    error: reviewQuery.error ?? findingsQuery.error,
    refetch: () => {
      void reviewQuery.refetch();
      void findingsQuery.refetch();
    },
  };
}
