import type { ChtkStandardSet } from "../types/review.types";

/**
 * MOCK DATA — các bộ tiêu chuẩn CHTK đã nạp bằng file Excel từ trước.
 * Tính năng tải Excel để tạo/cập nhật một bộ sẽ làm ở giai đoạn sau; ở đây chỉ
 * mô phỏng danh sách đã có sẵn để chọn khi tạo hồ sơ thẩm định mới.
 * Khi có backend, đây là `GET /standard-sets`.
 */
export const MOCK_STANDARD_SETS: readonly ChtkStandardSet[] = [
  {
    id: "std-chtk-4sao-v1",
    name: "Bộ CHTK 4 sao — bản chuẩn",
    fileName: "chtk-4-sao-v1.xlsx",
    ruleCount: 67,
    uploadedAt: "2026-08-20",
  },
  {
    id: "std-chtk-5sao-v1",
    name: "Bộ CHTK 5 sao — bản chuẩn",
    fileName: "chtk-5-sao-v1.xlsx",
    ruleCount: 74,
    uploadedAt: "2026-09-02",
  },
];
