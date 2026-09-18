"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CheckIcon, ClockIcon, LoaderIcon } from "@/shared/components/icons";
import { PROCESSING_STEPS } from "../constants/review.constants";
import { useReviewProcessingStatus } from "../hooks/useReviewProcessingStatus";
import { reviewsService } from "../services/reviews.service";
import type { Review } from "../types/review.types";
import { CheckTypeBreakdownBars } from "./CheckTypeBreakdownBars";

type StepState = "done" | "running" | "pending";

export function ProcessingProgress({
  reviewId,
  workspaceSlug,
}: {
  reviewId: string;
  workspaceSlug: string;
}) {
  const [review, setReview] = useState<Review | undefined>(undefined);
  const { percent, currentStepIndex, isDone, breakdown } =
    useReviewProcessingStatus(reviewId);

  useEffect(() => {
    let cancelled = false;
    reviewsService.getReview(reviewId).then((result) => {
      if (!cancelled) setReview(result);
    });
    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          {review ? review.name : "Đang chuẩn bị hồ sơ..."}
        </h1>
        {review && (
          <p className="text-sm text-text-muted">
            <span className="numeric">{review.code}</span> · {review.zoneName}
          </p>
        )}
      </header>

      <section className="space-y-4 rounded-lg bg-surface-raised p-4 shadow-ds-small">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-text-primary">
            {isDone ? "Kết thúc quá trình phân tích" : "AI đang đọc bản vẽ"}
          </h2>
          <span className="numeric text-sm text-text-muted">{percent}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
          <span
            className={`block h-full rounded-full transition-[width] duration-150 ${
              isDone ? "bg-pass" : "bg-pending"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <ul className="space-y-2.5">
          {PROCESSING_STEPS.map((step, index) => {
            const state: StepState = isDone
              ? "done"
              : index < currentStepIndex
                ? "done"
                : index === currentStepIndex
                  ? "running"
                  : "pending";

            return (
              <li key={step.key} className="flex items-center gap-2.5 text-sm">
                {state === "done" && (
                  <CheckIcon className="size-4 shrink-0 text-pass" />
                )}
                {state === "running" && (
                  <LoaderIcon className="size-4 shrink-0 animate-spin text-pending" />
                )}
                {state === "pending" && (
                  <ClockIcon className="size-4 shrink-0 text-text-muted" />
                )}
                <span
                  className={
                    state === "pending" ? "text-text-muted" : "text-text-secondary"
                  }
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {isDone && (
        <section className="space-y-4 rounded-lg bg-surface-raised p-4 shadow-ds-small">
          <div>
            <h2 className="text-sm font-medium text-text-primary">
              Số phần tử đã phân tích theo loại kiểm tra
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Thống kê sơ bộ trước khi vào xem chi tiết từng tiêu chí.
            </p>
          </div>
          <CheckTypeBreakdownBars rows={breakdown} />
        </section>
      )}

      {isDone && (
        <div className="flex justify-end">
          <Link
            href={`/${workspaceSlug}/reviews/${reviewId}`}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-text-on-accent
                       transition-colors duration-150 hover:bg-accent-hover
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            Xem kết quả thẩm định bản vẽ
          </Link>
        </div>
      )}
    </section>
  );
}
