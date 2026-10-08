import { ReviewDetailContainer } from "@/features/reviews/containers/ReviewDetailContainer";

type ReviewPageProps = {
  params: Promise<{ slug: string; reviewId: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { slug, reviewId } = await params;

  return <ReviewDetailContainer workspaceSlug={slug} reviewId={reviewId} />;
}
