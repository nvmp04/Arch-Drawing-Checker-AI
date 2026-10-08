"use client";

import { useQuery } from "@tanstack/react-query";

import { ruleKeys } from "../constants/rule.queryKeys";
import { rulesService } from "../services/rules.service";

/**
 * Tiêu chí của bộ tiêu chuẩn đang chọn, đã làm phẳng từ `sections[]`.
 *
 * `ruleSetId` rỗng nghĩa là chưa có bộ nào được chọn (chưa nạp file) —
 * `enabled: false` giữ query nằm im thay vì gọi với khóa vô nghĩa.
 */
export function useRules(workspaceSlug: string, ruleSetId: string) {
  return useQuery({
    queryKey: ruleKeys.list(workspaceSlug, ruleSetId),
    queryFn: () => rulesService.listRules(workspaceSlug, ruleSetId),
    enabled: ruleSetId !== "",
    staleTime: 5 * 60 * 1000,
  });
}
