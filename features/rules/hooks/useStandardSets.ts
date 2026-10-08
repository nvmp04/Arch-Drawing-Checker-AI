"use client";

import { useQuery } from "@tanstack/react-query";

import { ruleKeys } from "../constants/rule.queryKeys";
import { rulesService } from "../services/rules.service";

/**
 * Các bộ tiêu chuẩn CHTK đã nạp — đổ vào dropdown chọn bộ đang xem.
 *
 * Danh sách chỉ dài thêm khi người dùng nạp một file Excel mới, nên để
 * `staleTime` dài.
 */
export function useStandardSets(workspaceSlug: string) {
  return useQuery({
    queryKey: ruleKeys.standardSets(workspaceSlug),
    queryFn: () => rulesService.listStandardSets(workspaceSlug),
    staleTime: 5 * 60 * 1000,
  });
}
