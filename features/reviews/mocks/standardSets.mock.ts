import type { ChtkStandardSet } from "../types/review.types";

/**
 * MOCK DATA — bộ tiêu chuẩn CHTK để chọn khi tạo hồ sơ thẩm định mới.
 *
 * Chưa có API danh sách bộ rules cho form, và backend chỉ nhận **đúng** id demo
 * dưới đây làm `ruleSetId` — id khác trả `404 RULE_SET_NOT_FOUND`.
 * Nguồn: `arch-drawing-checker-backend/docs/contracts/fe-review-upload.md` §0.1.
 */
export const MOCK_STANDARD_SETS: readonly ChtkStandardSet[] = [
  {
    id: "c4a2d8b3-6e5f-4a7b-8d9c-3f2e1a4b5c02",
    name: "Bộ CHTK demo (4 SAO)",
    fileName: "chtk-4-sao-demo.xlsx",
    ruleCount: 67,
    uploadedAt: "2026-09-28",
  },
];
