import Link from "next/link";

import { ArrowRightIcon } from "@/shared/components/icons";

/** Khung card có tiêu đề, phụ đề và link "Xem tất cả". */
export function SectionCard({
  title,
  subtitle,
  seeAllHref,
  seeAllLabel = "Xem tất cả",
  children,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section className="rounded-lg bg-surface-raised shadow-ds-small">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-subtle px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-text-primary">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>
          )}
        </div>

        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs
                       text-accent-text transition-colors duration-150
                       hover:bg-surface-hover
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            {seeAllLabel}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        )}
      </header>

      <div className={bodyClassName ?? "p-4"}>{children}</div>
    </section>
  );
}
