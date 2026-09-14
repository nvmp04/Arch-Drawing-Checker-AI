import Link from "next/link";

interface WorkspaceSwitcherProps {
  workspaceSlug: string;
}

export function WorkspaceSwitcher({ workspaceSlug }: WorkspaceSwitcherProps) {
  return (
    <Link href={`/${workspaceSlug}/dashboard`}>
      Workspace: {workspaceSlug}
    </Link>
  );
}