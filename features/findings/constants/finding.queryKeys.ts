/** Khóa cache TanStack Query của feature findings. Quy ước: xem `review.queryKeys.ts`. */
export const findingKeys = {
  all: ["findings"] as const,

  lists: () => [...findingKeys.all, "list"] as const,
  list: (workspaceSlug: string) => [...findingKeys.lists(), workspaceSlug] as const,

  details: () => [...findingKeys.all, "detail"] as const,
  detail: (findingId: string) => [...findingKeys.details(), findingId] as const,
} as const;
