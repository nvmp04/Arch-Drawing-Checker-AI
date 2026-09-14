import { FindingListContainer } from "@/features/findings/containers/FindingListContainer";

type ZoneFindingsPageProps = {
  params: Promise<{ slug: string; zoneId: string }>;
};

export default async function ZoneFindingsPage({ params }: ZoneFindingsPageProps) {
  const { slug } = await params;

  return <FindingListContainer workspaceSlug={slug} />;
}
