"use client";

import { useQuery } from "@tanstack/react-query";

import { reviewKeys } from "../constants/review.queryKeys";
import { reviewsService } from "../services/reviews.service";

/**
 * Danh sách phân khu và bộ tiêu chuẩn CHTK để đổ vào form tạo hồ sơ.
 *
 * Hai danh mục này gần như không đổi trong một phiên làm việc, nên để
 * `staleTime` dài: người dùng vào ra trang "Thẩm định mới" nhiều lần khi soạn
 * hồ sơ, không cần tải lại mỗi lần.
 */
export function useReviewFormOptions() {
  return useQuery({
    queryKey: reviewKeys.formOptions(),
    queryFn: () => reviewsService.listFormOptions(),
    staleTime: 10 * 60 * 1000,
  });
}
