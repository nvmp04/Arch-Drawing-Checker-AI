"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardKeys } from "../constants/dashboard.queryKeys";
import { dashboardService } from "../services/dashboard.service";

/**
 * Toàn bộ dữ liệu của trang Bảng điều khiển trong một query.
 *
 * Một query chứ không phải bốn: số liệu tổng hợp phải nhất quán với nhau trong
 * cùng một thời điểm. Nếu tách ra, bốn ô KPI và hai biểu đồ có thể đến từ hai
 * lần chụp khác nhau và cộng không khớp — người đọc dashboard sẽ mất tin.
 */
export function useDashboardSummary(workspaceSlug: string) {
  return useQuery({
    queryKey: dashboardKeys.overview(workspaceSlug),
    queryFn: () => dashboardService.getOverview(workspaceSlug),
  });
}
