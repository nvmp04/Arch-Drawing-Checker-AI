"use client";

import { ErrorState, errorDetail } from "@/shared/components/ErrorState";
import { Skeleton, SkeletonBlock } from "@/shared/components/Skeleton";
import { ReviewUploadForm } from "../components/ReviewUploadForm";
import { useReviewFormOptions } from "../hooks/useReviewFormOptions";

/** Khung chờ mô phỏng đúng bố cục form: vùng thả file rồi tới các trường nhập. */
function FormSkeleton() {
  return (
    <SkeletonBlock label="Đang tải danh mục phân khu và bộ tiêu chuẩn…" className="space-y-6">
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
    </SkeletonBlock>
  );
}

export function NewReviewContainer({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const { data, isPending, isError, error, refetch } = useReviewFormOptions();

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Tạo hồ sơ thẩm định mới
        </h1>
        <p className="text-sm text-text-muted">
          Tải lên bản vẽ PDF, chọn tiêu chuẩn áp dụng và nhóm tiêu chí cần đối
          chiếu.
        </p>
      </header>

      {isPending ? (
        <FormSkeleton />
      ) : isError ? (
        <ErrorState
          message="Không tải được danh mục phân khu và bộ tiêu chuẩn."
          detail={errorDetail(error)}
          onRetry={() => void refetch()}
        />
      ) : (
        <ReviewUploadForm
          workspaceSlug={workspaceSlug}
          zoneOptions={data.zoneOptions}
          standardSets={data.standardSets}
        />
      )}
    </section>
  );
}
