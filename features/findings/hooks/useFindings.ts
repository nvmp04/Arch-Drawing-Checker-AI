"use client";

import { useQuery } from "@tanstack/react-query";

import { findingKeys } from "../constants/finding.queryKeys";
import { findingsService } from "../services/findings.service";

/**
 * Toàn bộ tiêu chí đã đối chiếu trong một không gian làm việc, kèm cây hồ sơ
 * để gom nhóm.
 *
 * Hook chỉ nối `queryKey` với hàm service — không lọc, không sắp xếp, không
 * gom nhóm. Phần đó thuộc về `FindingList` (component), để dữ liệu trong cache
 * luôn là dữ liệu thô của server.
 */
export function useFindings(workspaceSlug: string) {
  return useQuery({
    queryKey: findingKeys.list(workspaceSlug),
    queryFn: () => findingsService.listFindings(workspaceSlug),
  });
}
