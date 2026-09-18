import { NewReviewContainer } from "@/features/reviews/containers/NewReviewContainer";

type NewReviewPageProps = { params: Promise<{ slug: string }> };

export default async function NewReviewPage({ params }: NewReviewPageProps) {
  const { slug } = await params;

  return <NewReviewContainer workspaceSlug={slug} />;
}
