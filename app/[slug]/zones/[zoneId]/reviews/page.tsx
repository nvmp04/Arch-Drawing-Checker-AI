import { ReviewListContainer } from "@/features/reviews/containers/ReviewListContainer";

type ZoneReviewsPageProps = {
  params: Promise<{ slug: string; zoneId: string }>;
};

export default async function ZoneReviewsPage({ params }: ZoneReviewsPageProps) {
  const { slug } = await params;

  return <ReviewListContainer workspaceSlug={slug} />;
}
