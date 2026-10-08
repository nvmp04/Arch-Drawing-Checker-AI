"use client";

import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState, errorDetail } from "@/shared/components/ErrorState";
import { Skeleton, SkeletonBlock } from "@/shared/components/Skeleton";
import { ReviewWorkspace } from "../components/ReviewWorkspace";
import { useReviewDetail } from "../hooks/useReviewDetail";

/** Khung chờ mô phỏng bố cục thật: khung xem bản vẽ bên trái, khung kết quả bên phải. */
function WorkspaceSkeleton() {
  return (
    <SkeletonBlock label="Đang tải hồ sơ thẩm định…" className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_var(--spacing-inspector)]">
        <Skeleton className="h-[60vh] w-full" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    </SkeletonBlock>
  );
}

export function ReviewDetailContainer({
  workspaceSlug,
  reviewId,
}: {
  workspaceSlug: string;
  reviewId: string;
}) {
  const { review, findings, isPending, isError, error, refetch } =
    useReviewDetail(workspaceSlug, reviewId);

  if (isPending) return <WorkspaceSkeleton />;

  if (isError) {
    return (
      <ErrorState
        message="Không tải được hồ sơ thẩm định này."
        detail={errorDetail(error)}
        onRetry={refetch}
      />
    );
  }

  // Tải xong nhưng không có hồ sơ nào mang mã này — đây là trạng thái rỗng, không phải lỗi.
  if (!review) {
    return (
      <div className="rounded-lg bg-surface-raised px-4 py-10 text-center shadow-ds-small">
        <EmptyState message="Không tìm thấy hồ sơ thẩm định này." />
      </div>
    );
  }

  return <ReviewWorkspace review={review} findings={findings} />;
}
