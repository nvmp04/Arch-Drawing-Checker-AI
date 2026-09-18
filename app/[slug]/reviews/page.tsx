import { ReviewListContainer } from "@/features/reviews/containers/ReviewListContainer";

type ReviewsPageProps = { params: Promise<{ slug: string }> };

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { slug } = await params;

  return <ReviewListContainer workspaceSlug={slug} />;
}
