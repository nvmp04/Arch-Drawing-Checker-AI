"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/shared/components/ThemeToggle";
import {
  DashboardIcon,
  FindingIcon,
  InboxIcon,
  MemberIcon,
  MyTaskIcon,
  PlusIcon,
  ReviewIcon,
  RuleIcon,
  ZoneIcon,
} from "@/shared/components/icons";

type NavItem = {
  label: string;
  segment: string;
  Icon: (props: { className?: string }) => React.ReactElement;
};

const WORKSPACE_ITEMS: readonly NavItem[] = [
  { label: "Bảng điều khiển", segment: "dashboard", Icon: DashboardIcon },
  { label: "Hồ sơ thẩm định", segment: "reviews", Icon: ReviewIcon },
  { label: "Kết quả tiêu chí", segment: "findings", Icon: FindingIcon },
  { label: "Tiêu chuẩn CHTK", segment: "rules", Icon: RuleIcon },
  { label: "Phân khu", segment: "zones", Icon: ZoneIcon },
  { label: "Thành viên", segment: "members", Icon: MemberIcon },
] as const;

const PERSONAL_ITEMS: readonly NavItem[] = [
  { label: "Hộp thư", segment: "inbox", Icon: InboxIcon },
  { label: "Việc của tôi", segment: "my-tasks", Icon: MyTaskIcon },
] as const;

function NavLink({
  item,
  workspaceSlug,
  isActive,
}: {
  item: NavItem;
  workspaceSlug: string;
  isActive: boolean;
}) {
  const { label, segment, Icon } = item;
  return (
    <Link
      href={`/${workspaceSlug}/${segment}`}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-text-secondary
                 transition-colors duration-150
                 hover:bg-surface-hover hover:text-text-primary
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                 data-[active=true]:bg-surface-active data-[active=true]:text-text-primary
                 data-[active=true]:font-medium"
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar({ workspaceSlug }: { workspaceSlug: string }) {
  const pathname = usePathname();

  const isActive = (segment: string) => {
    const base = `/${workspaceSlug}/${segment}`;
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border-subtle bg-surface-raised">
      {/* Thương hiệu + thêm hồ sơ mới — cao 64px để thẳng hàng với Topbar */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-4">
        <Link
          href={`/${workspaceSlug}/dashboard`}
          className="truncate text-sm font-semibold tracking-tight text-text-primary
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          Drawing Checker
        </Link>

        <Link
          href={`/${workspaceSlug}/reviews/new`}
          aria-label="Thêm hồ sơ mới"
          title="Thêm hồ sơ mới"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md
                     bg-surface-raised text-text-secondary shadow-ds-border
                     transition-colors duration-150
                     hover:bg-surface-hover hover:text-text-primary
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <PlusIcon className="size-4" />
        </Link>
      </div>

      {/* Điều hướng */}
      <nav
        aria-label="Điều hướng không gian làm việc"
        className="flex-1 space-y-6 overflow-y-auto p-3"
      >
        <div className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
            Không gian làm việc
          </p>
          {WORKSPACE_ITEMS.map((item) => (
            <NavLink
              key={item.segment}
              item={item}
              workspaceSlug={workspaceSlug}
              isActive={isActive(item.segment)}
            />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
            Cá nhân
          </p>
          {PERSONAL_ITEMS.map((item) => (
            <NavLink
              key={item.segment}
              item={item}
              workspaceSlug={workspaceSlug}
              isActive={isActive(item.segment)}
            />
          ))}
        </div>
      </nav>

      {/* Tài khoản + theme */}
      <div className="flex shrink-0 items-center gap-2 border-t border-border-subtle p-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full
                       bg-surface-sunken text-xs font-medium text-text-secondary"
            aria-hidden
          >
            NV
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-text-primary">
              Nguyễn Văn A
            </span>
            <span className="block truncate text-xs text-text-muted">
              Chủ nhiệm thẩm định
            </span>
          </span>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
