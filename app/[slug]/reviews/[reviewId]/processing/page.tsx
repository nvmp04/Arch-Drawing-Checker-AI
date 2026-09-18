import { ReviewProcessingContainer } from "@/features/reviews/containers/ReviewProcessingContainer";

type ProcessingPageProps = {
  params: Promise<{ slug: string; reviewId: string }>;
};

export default async function ProcessingPage({ params }: ProcessingPageProps) {
  const { slug, reviewId } = await params;

  return <ReviewProcessingContainer reviewId={reviewId} workspaceSlug={slug} />;
}
