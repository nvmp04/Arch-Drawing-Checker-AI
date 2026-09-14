import { FindingListContainer } from "@/features/findings/containers/FindingListContainer";

type FindingsPageProps = { params: Promise<{ slug: string }> };

export default async function FindingsPage({ params }: FindingsPageProps) {
  const { slug } = await params;

  return <FindingListContainer workspaceSlug={slug} />;
}
