import type {
  ChtkCategory,
  FindingSeverity,
  FindingStatus,
  ReasoningGroup,
} from "@/shared/constants/enums";

/** Hồ sơ thẩm định — đơn vị gom nhóm ngoài cùng của trang Kết quả tiêu chí. */
export type ReviewDossier = {
  /** Trùng với reviewId của finding — dùng để điều hướng sang trang review. */
  id: string;
  /** Mã hồ sơ, ví dụ "PN2-DN-01". */
  code: string;
  /** Tên hồ sơ, ví dụ "Bản vẽ mẫu PN2 Đà Nẵng — Shophouse điển hình". */
  name: string;
};

/**
 * Vùng khoanh của một finding trên trang bản vẽ, tính theo phần trăm (0–100)
 * kích thước trang — không phụ thuộc độ phân giải render, nên luôn khớp dù
 * phóng to/thu nhỏ hay đổi kích thước khung xem.
 */
export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Finding = {
  id: string;
  /** Hồ sơ thẩm định chứa tiêu chí này. */
  reviewId: string;
  status: FindingStatus;
  severity: FindingSeverity;
  /** Chỉ mục trong bộ tiêu chuẩn CHTK, ví dụ "3.1.1". */
  ruleIndex: string;
  /** Loại chi tiết, ví dụ "Lan can kính — độ dày kính". */
  detailLabel: string;
  /** Giá trị máy trích xuất được từ bản vẽ. */
  extractedValue: string;
  /** Giá trị tiêu chuẩn áp dụng để đối chiếu. */
  standardValue: string;
  /** Độ tin cậy của phép trích xuất, 0–1. */
  confidence: number;
  group: ReasoningGroup;
  category: ChtkCategory;
  /** Số thứ tự trang trong file PDF bản vẽ. */
  pageNumber: number;
  /** Vùng khoanh trên trang — mock ngẫu nhiên ở giai đoạn chưa có backend. */
  boundingBox: BoundingBox;
  /** Ghi chú của chuyên gia thẩm định — chưa có thì để trống, không phải lỗi. */
  note?: string;
};
