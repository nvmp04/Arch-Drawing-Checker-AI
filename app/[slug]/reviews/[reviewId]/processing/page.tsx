import { ReviewProcessingContainer } from "@/features/reviews/containers/ReviewProcessingContainer";
export default async function ProcessingPage({ params }: { params: Promise<{ reviewId: string }> }) { const { reviewId } = await params; return <ReviewProcessingContainer reviewId={reviewId} />; }
