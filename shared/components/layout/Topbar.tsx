import { WorkspaceSwitcher } from "@/shared/components/layout/WorkspaceSwitcher";

interface TopbarProps {
  workspaceSlug: string;
}

export function Topbar({ workspaceSlug }: TopbarProps) {
  return (
    <header className="flex h-16 items-center border-b border-border-subtle bg-surface-page px-6">
      <WorkspaceSwitcher workspaceSlug={workspaceSlug} />
    </header>
  );
}
