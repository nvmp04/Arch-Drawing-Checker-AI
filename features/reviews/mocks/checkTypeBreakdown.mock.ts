import type { ReviewCheckTypeBreakdown } from "../types/review.types";

/**
 * MOCK DATA — số phần tử AI phân tích được theo loại kiểm tra, trả về cùng
 * lúc một hồ sơ xử lý xong. Khi có backend, đây là một phần của payload kết
 * quả phân tích cho hồ sơ đó.
 */
export const MOCK_CHECK_TYPE_BREAKDOWN: readonly ReviewCheckTypeBreakdown[] = [
  { checkType: "A", count: 38 },
  { checkType: "B", count: 25 },
  { checkType: "C", count: 3 },
  { checkType: "D", count: 1 },
];
