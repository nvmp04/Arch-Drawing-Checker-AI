import { EmptyState } from "@/shared/components/EmptyState";
import { ReviewListItem } from "@/features/reviews/components/ReviewListItem";
import type { Review } from "@/features/reviews/types/review.types";
import { SectionCard } from "./SectionCard";

export function RecentReviewList({
  reviews,
  workspaceSlug,
}: {
  reviews: readonly Review[];
  workspaceSlug: string;
}) {
  return (
    <SectionCard
      title="Hồ sơ gần đây"
      subtitle="Trạng thái xử lý và kết quả thẩm tra của từng bộ bản vẽ"
      seeAllHref={`/${workspaceSlug}/reviews`}
      bodyClassName=""
    >
      {reviews.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <EmptyState message="Chưa có hồ sơ thẩm định nào." />
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewListItem review={review} workspaceSlug={workspaceSlug} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
