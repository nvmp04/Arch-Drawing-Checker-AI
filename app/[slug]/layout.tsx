import { Sidebar } from "@/shared/components/layout/Sidebar";

type WorkspaceLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-surface-page">
      <Sidebar workspaceSlug={slug} />
      <div className="min-h-screen pl-64">
        <main className="min-w-0 p-6">{children}</main>
      </div>
    </div>
  );
}
