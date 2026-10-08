"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reviewKeys } from "../constants/review.queryKeys";
import { reviewsService } from "../services/reviews.service";
import type { CreateReviewInput, Review } from "../types/review.types";

/**
 * Tạo hồ sơ thẩm định mới — upload PDF lên backend (multipart).
 *
 * Sau khi tạo xong làm hai việc, theo đúng thứ tự:
 * 1. `setQueryData` cho chi tiết hồ sơ vừa tạo — trang `/processing` điều
 *    hướng tới ngay lập tức, có sẵn dữ liệu trong cache thì không chớp một
 *    nhịp loading;
 * 2. `invalidateQueries` cho mọi danh sách hồ sơ — hồ sơ mới phải xuất hiện
 *    khi người dùng quay lại trang danh sách.
 *
 * Không `invalidate` chi tiết vừa `setQueryData`, nếu không lời gọi ở bước 1
 * thành vô nghĩa.
 */
export function useCreateReview(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation<Review, Error, CreateReviewInput>({
    mutationFn: (input) => reviewsService.createReview(workspaceSlug, input),
    onSuccess: (review) => {
      queryClient.setQueryData(reviewKeys.detail(review.id), review);
      void queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}
