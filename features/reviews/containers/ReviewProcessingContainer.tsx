import { ProcessingProgress } from "../components/ProcessingProgress";

export function ReviewProcessingContainer({
  reviewId,
  workspaceSlug,
}: {
  reviewId: string;
  workspaceSlug: string;
}) {
  return <ProcessingProgress reviewId={reviewId} workspaceSlug={workspaceSlug} />;
}
