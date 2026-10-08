/** Khóa cache TanStack Query của feature dashboard. Quy ước: xem `review.queryKeys.ts`. */
export const dashboardKeys = {
  all: ["dashboard"] as const,

  overviews: () => [...dashboardKeys.all, "overview"] as const,
  overview: (workspaceSlug: string) =>
    [...dashboardKeys.overviews(), workspaceSlug] as const,
} as const;
