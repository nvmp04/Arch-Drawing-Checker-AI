"use client";

import { useQuery } from "@tanstack/react-query";

import { reviewKeys } from "../constants/review.queryKeys";
import { reviewsService } from "../services/reviews.service";

/** Danh sách hồ sơ thẩm định của một không gian làm việc. */
export function useReviews(workspaceSlug: string) {
  return useQuery({
    queryKey: reviewKeys.list(workspaceSlug),
    queryFn: () => reviewsService.listReviews(workspaceSlug),
  });
}
