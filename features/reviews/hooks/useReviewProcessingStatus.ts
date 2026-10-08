"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { reviewKeys } from "../constants/review.queryKeys";
import { PROCESSING_STEPS } from "../constants/review.constants";
import { reviewsService } from "../services/reviews.service";
import type { ReviewCheckTypeBreakdown } from "../types/review.types";

const TICK_MS = 220;
const PERCENT_PER_TICK = 4;

export type ReviewProcessingStatus = {
  percent: number;
  currentStepIndex: number;
  isDone: boolean;
  breakdown: readonly ReviewCheckTypeBreakdown[];
};

/**
 * Mô phỏng tiến trình AI đọc bản vẽ. Chưa có backend nên phần trăm tự chạy
 * bằng đồng hồ ở client; khi có API trạng thái xử lý thật, thay khối
 * `setInterval` bằng một `useQuery` có `refetchInterval` — hình dạng trả về của
 * hook giữ nguyên nên `ProcessingProgress` không phải sửa.
 *
 * Phần phân rã theo loại kiểm tra thì **đã** đi qua TanStack Query: `enabled`
 * giữ query nằm im cho tới khi đồng hồ chạy hết, và kết quả vào thẳng cache
 * dưới khóa của hồ sơ — quay lại trang này không phải chờ lần nữa.
 */
export function useReviewProcessingStatus(
  reviewId: string,
): ReviewProcessingStatus {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        const next = Math.min(prev + PERCENT_PER_TICK, 100);
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [reviewId]);

  const { data: breakdown = [] } = useQuery({
    queryKey: reviewKeys.checkTypeBreakdown(reviewId),
    queryFn: () => reviewsService.getCheckTypeBreakdown(reviewId),
    enabled: percent >= 100,
  });

  const stepCount = PROCESSING_STEPS.length;
  const currentStepIndex = Math.min(
    Math.floor((percent / 100) * stepCount),
    stepCount - 1,
  );

  return {
    percent,
    currentStepIndex,
    isDone: percent >= 100 && breakdown.length > 0,
    breakdown,
  };
}
