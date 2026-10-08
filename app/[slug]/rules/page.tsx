import { RuleListContainer } from "@/features/rules/containers/RuleListContainer";

type RulesPageProps = { params: Promise<{ slug: string }> };

export default async function RulesPage({ params }: RulesPageProps) {
  const { slug } = await params;

  return <RuleListContainer workspaceSlug={slug} />;
}
