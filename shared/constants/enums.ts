/** Kết luận của một tiêu chí trên bản vẽ. */
export type FindingStatus =
  | "pass" // Đạt
  | "fail" // Không đạt
  | "warning" // Cảnh báo
  | "pending" // Chờ người thẩm định
  | "approved" // Đã duyệt — người đã xác nhận kết luận của máy
  | "unknown"; // Không xác định

/** Mức độ ảnh hưởng của vi phạm. */
export type FindingSeverity = "low" | "medium" | "high" | "critical";

/**
 * Nhóm trích xuất — cách máy lấy được dữ liệu cho tiêu chí này.
 * Quyết định khoảng độ tin cậy kỳ vọng, không phải mức độ nghiêm trọng.
 */
export type ReasoningGroup = "A" | "B" | "C";

/** Nhóm tiêu chuẩn CHTK — suy ra từ chữ số đầu của chỉ mục tiêu chí. */
export type ChtkCategory =
  | "facade" // 1.x — Mặt ngoài
  | "dimension" // 2.x — Kích thước
  | "stair-ramp" // 3.x — Thang - Ramp
  | "structure" // 4.x — Cấu tạo
  | "finishing"; // 5.x — Hoàn thiện

export type HouseType = "apartment" | "villa" | "townhouse";
