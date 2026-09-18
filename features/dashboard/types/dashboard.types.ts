import type { StatusCounts } from "@/shared/components/StatusStackedBar";
import type { CheckType, ChtkCategory } from "@/shared/constants/enums";

/** Một dòng trong biểu đồ tỷ lệ đạt theo nhóm CHTK. */
export type GroupPassRate = {
  category: ChtkCategory;
  /** Số tiêu chí đã kết luận được (không tính "Không xác định"). */
  concluded: number;
  /** Số tiêu chí đạt (Đạt + Đã duyệt). */
  passed: number;
  /** Số tiêu chí không tìm thấy dữ liệu trên bản vẽ. */
  missing: number;
  /** 0–100, tính trên `concluded`. */
  percent: number;
};

/** Một dòng trong biểu đồ kết luận theo loại kiểm tra. */
export type CheckTypeBreakdown = {
  checkType: CheckType;
  total: number;
  counts: StatusCounts;
};

export type DashboardSummary = {
  /** Không đạt + Cảnh báo + Chờ người thẩm định. */
  actionRequired: number;
  /** 0–100. Mẫu số loại trừ các tiêu chí thiếu dữ liệu. */
  averagePassRate: number;
  passRateNumerator: number;
  passRateDenominator: number;
  /** Tổng tiêu chí đã quét, tính trên các hồ sơ đã thẩm định xong. */
  testedCriteria: number;
  completedReviewCount: number;
  /** Bộ tiêu chuẩn đang áp dụng. */
  standardLevel: string;
  activeRuleCount: number;
  totalRuleCount: number;
  groupPassRates: readonly GroupPassRate[];
  checkTypeBreakdowns: readonly CheckTypeBreakdown[];
  /** Tổng theo trạng thái, dùng cho hàng chú thích của biểu đồ loại kiểm tra. */
  statusTotals: StatusCounts;
};
