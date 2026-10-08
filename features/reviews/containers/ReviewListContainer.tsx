"use client";

import Link from "next/link";

import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState, errorDetail } from "@/shared/components/ErrorState";
import { PlusIcon } from "@/shared/components/icons";
import { SkeletonList } from "@/shared/components/Skeleton";
import { useReviews } from "../hooks/useReviews";
import { ReviewListItem } from "../components/ReviewListItem";

export function ReviewListContainer({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const { data: reviews, isPending, isError, error, refetch } = useReviews(workspaceSlug);

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Hồ sơ thẩm định
          </h1>
          <p className="text-sm text-text-muted">
            Toàn bộ bộ bản vẽ đã tải lên để đối chiếu với tiêu chuẩn CHTK.
          </p>
        </div>

        <Link
          href={`/${workspaceSlug}/reviews/new`}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-text-on-accent
                     transition-colors duration-150 hover:bg-accent-hover
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <PlusIcon className="size-4" />
          Thẩm định mới
        </Link>
      </header>

      {isPending ? (
        <SkeletonList rows={4} label="Đang tải danh sách hồ sơ thẩm định…" />
      ) : isError ? (
        <ErrorState
          message="Không tải được danh sách hồ sơ thẩm định."
          detail={errorDetail(error)}
          onRetry={() => void refetch()}
        />
      ) : reviews.length === 0 ? (
        <div className="rounded-lg bg-surface-raised px-4 py-10 text-center shadow-ds-small">
          <EmptyState message="Chưa có hồ sơ thẩm định nào." />
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle rounded-lg bg-surface-raised shadow-ds-small">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewListItem review={review} workspaceSlug={workspaceSlug} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
