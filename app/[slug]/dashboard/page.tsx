import { DashboardOverviewContainer } from "@/features/dashboard/containers/DashboardOverviewContainer";

type DashboardPageProps = { params: Promise<{ slug: string }> };

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;

  return <DashboardOverviewContainer workspaceSlug={slug} />;
}
