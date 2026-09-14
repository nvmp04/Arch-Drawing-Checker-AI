import { ReviewDetailContainer } from "@/features/reviews/containers/ReviewDetailContainer";
export default async function ReviewPage({ params }: { params: Promise<{ reviewId: string }> }) { const { reviewId } = await params; return <ReviewDetailContainer reviewId={reviewId} />; }
