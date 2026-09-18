import type { StatusCounts } from "@/shared/components/StatusStackedBar";
import type { CheckType, ChtkCategory, HouseType } from "@/shared/constants/enums";

export type ReviewStatus = "draft" | "processing" | "completed";
export type ProcessingState = "idle" | "running" | "failed";

/** Một hồ sơ thẩm định = một bộ bản vẽ đã nộp để đối chiếu. */
export type Review = {
  id: string;
  /** Mã hồ sơ, ví dụ "PN2-DN-01". */
  code: string;
  /** Tên file / tiêu đề bản vẽ. */
  name: string;
  status: ReviewStatus;
  /** Chỉ có nghĩa khi status = "processing". */
  processingState: ProcessingState;
  /** Phần trăm AI đã phân tích, 0–100. Chỉ dùng khi đang xử lý. */
  progressPercent?: number;
  pageCount: number;
  zoneName: string;
  houseType: HouseType;
  /**
   * Phân rã tiêu chí theo trạng thái. Hồ sơ đang xử lý hoặc lỗi thì toàn 0.
   * Khi có backend, đây là aggregate do API trả về.
   */
  statusCounts: StatusCounts;
  /** ISO date của lần cập nhật gần nhất. */
  updatedAt: string;
  assignee: { name: string; initials: string };
};

/**
 * Một bộ tiêu chuẩn CHTK đã nạp bằng file Excel. Việc tải Excel để tạo bộ mới
 * làm ở giai đoạn sau — ở màn tạo hồ sơ, người dùng chỉ chọn từ các bộ đã có.
 */
export type ChtkStandardSet = {
  id: string;
  name: string;
  fileName: string;
  ruleCount: number;
  uploadedAt: string;
};

/** Lựa chọn phân khu ở form tạo hồ sơ. */
export type ZoneOption = {
  id: string;
  name: string;
};

/** Dữ liệu gửi đi khi tạo một hồ sơ thẩm định mới. */
export type CreateReviewInput = {
  name: string;
  zoneId: string;
  standardSetId: string;
  houseType: HouseType;
  categories: readonly ChtkCategory[];
  file: { name: string; sizeBytes: number };
};

/** Số phần tử AI đã phân tích được, phân rã theo loại kiểm tra. */
export type ReviewCheckTypeBreakdown = {
  checkType: CheckType;
  count: number;
};

/** Một bước trong mô phỏng quá trình AI đọc bản vẽ. */
export type ProcessingStepDef = {
  key: string;
  label: string;
};
