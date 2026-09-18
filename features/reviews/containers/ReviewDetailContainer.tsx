import { MOCK_FINDINGS } from "@/features/findings/mocks/findings.mock";
import { EmptyState } from "@/shared/components/EmptyState";
import { reviewsService } from "../services/reviews.service";
import { ReviewWorkspace } from "../components/ReviewWorkspace";

export async function ReviewDetailContainer({ reviewId }: { reviewId: string }) {
  const review = await reviewsService.getReview(reviewId);

  if (!review) {
    return (
      <div className="rounded-lg bg-surface-raised px-4 py-10 text-center shadow-ds-small">
        <EmptyState message="Không tìm thấy hồ sơ thẩm định này." />
      </div>
    );
  }

  // MOCK — D-12: chỉ hồ sơ rv-2026-018 có đủ dữ liệu tiêu chí chi tiết; hồ sơ
  // khác sẽ hiện khung xem trống. Khi có backend, đây là GET /findings?reviewId=.
  const findings = MOCK_FINDINGS.filter((finding) => finding.reviewId === review.id);

  return <ReviewWorkspace review={review} findings={findings} />;
}
