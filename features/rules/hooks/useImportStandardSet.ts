"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ruleKeys } from "../constants/rule.queryKeys";
import { rulesService } from "../services/rules.service";
import type { RuleSet } from "../types/rule.types";

/**
 * Gửi file Excel lên backend và nhận về các bộ tiêu chuẩn đọc được.
 *
 * Trả về **mảng** — mỗi sheet hiển thị trong file là một bộ.
 *
 * `onSuccess` phải dọn cache danh sách bộ: `rulesService` vừa ghi bộ mới vào
 * bộ nhớ phiên, nhưng query `standardSets` có `staleTime` 5 phút nên không tự
 * đọc lại. Thiếu `invalidate` là nạp xong mà dropdown vẫn trống.
 */
export function useImportStandardSet(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation<readonly RuleSet[], Error, File>({
    mutationFn: (file) => rulesService.importStandardSet({ file, workspaceSlug }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ruleKeys.standardSets(workspaceSlug),
      });
    },
  });
}
