/** Khóa cache TanStack Query của feature rules. Quy ước: xem `review.queryKeys.ts`. */
export const ruleKeys = {
  all: ["rules"] as const,

  /** Danh sách các bộ tiêu chuẩn đã nạp trong một không gian làm việc. */
  standardSets: (workspaceSlug: string) =>
    [...ruleKeys.all, "standard-sets", workspaceSlug] as const,

  lists: () => [...ruleKeys.all, "list"] as const,
  /**
   * Tiêu chí thuộc **một** bộ tiêu chuẩn.
   *
   * Khóa gồm cả `workspaceSlug` vì endpoint thật là
   * `GET /workspaces/:slug/rules/:ruleSetId` — `ruleSetId` là UUID nên đã đủ
   * phân biệt, nhưng khóa phải phản ánh đúng mọi tham số của lời gọi.
   */
  list: (workspaceSlug: string, ruleSetId: string) =>
    [...ruleKeys.lists(), workspaceSlug, ruleSetId] as const,

  details: () => [...ruleKeys.all, "detail"] as const,
  detail: (ruleId: string) => [...ruleKeys.details(), ruleId] as const,
} as const;
