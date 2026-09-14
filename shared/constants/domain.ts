import type {
  CheckType,
  ChtkCategory,
  ComparisonOperator,
  HouseType,
} from "./enums";

/* -------------------------------------------------------------------------- */
/* Nhóm CHTK                                                                   */
/* -------------------------------------------------------------------------- */

export const CATEGORY_CONFIG: Record<
  ChtkCategory,
  { section: string; label: string; short: string; dot: string }
> = {
  facade: {
    section: "1",
    label: "Mặt ngoài công trình",
    short: "Mặt ngoài",
    dot: "bg-cat-facade",
  },
  dimension: {
    section: "2",
    label: "Kích thước công trình",
    short: "Kích thước",
    dot: "bg-cat-dimension",
  },
  "stair-ramp": {
    section: "3",
    label: "Thang bộ – Ramp hầm",
    short: "Thang – Ramp",
    dot: "bg-cat-stair-ramp",
  },
  structure: {
    section: "4",
    label: "Chi tiết cấu tạo điển hình",
    short: "Cấu tạo",
    dot: "bg-cat-structure",
  },
  finishing: {
    section: "5",
    label: "Chi tiết hoàn thiện điển hình",
    short: "Hoàn thiện",
    dot: "bg-cat-finishing",
  },
};

export const CATEGORY_ORDER: readonly ChtkCategory[] = [
  "facade",
  "dimension",
  "stair-ramp",
  "structure",
  "finishing",
];

/** Chữ số đầu của mã tiêu chí quyết định nhóm CHTK: 1.x → Mặt ngoài... */
export function categoryFromRuleIndex(ruleIndex: string): ChtkCategory {
  const section = ruleIndex.split(".")[0];
  const map: Record<string, ChtkCategory> = {
    "1": "facade",
    "2": "dimension",
    "3": "stair-ramp",
    "4": "structure",
    "5": "finishing",
  };
  return map[section] ?? "structure";
}

/* -------------------------------------------------------------------------- */
/* Loại kiểm tra                                                               */
/* -------------------------------------------------------------------------- */

export const CHECK_TYPE_CONFIG: Record<
  CheckType,
  {
    label: string;
    title: string;
    method: string;
    expectedConfidence: string;
    dot: string;
    badge: string;
  }
> = {
  A: {
    label: "Đối chiếu số đo",
    title: "A. Đối chiếu số đo",
    method:
      "OCR chuỗi kích thước / cote trên bản vẽ, chuẩn hóa đơn vị rồi so với ngưỡng trong bảng tiêu chuẩn.",
    expectedConfidence: "85–95%",
    dot: "bg-group-a",
    badge: "bg-group-a/15 text-group-a",
  },
  B: {
    label: "Đối chiếu vật liệu / thông số",
    title: "B. Đối chiếu vật liệu / thông số",
    method:
      "Regex trên ghi chú bản vẽ kèm ngữ cảnh, so với cột tiêu chuẩn áp dụng.",
    expectedConfidence: "70–85%",
    dot: "bg-group-b",
    badge: "bg-group-b/15 text-group-b",
  },
  C: {
    label: "Phân tích hình học",
    title: "C. Phân tích hình học",
    method:
      "VLM đọc mặt cắt và hình học chi tiết để xác định chi tiết có được thể hiện đúng cấu tạo hay không.",
    expectedConfidence: "55–70%",
    dot: "bg-group-c",
    badge: "bg-group-c/15 text-group-c",
  },
  D: {
    label: "Phán đoán chủ quan",
    title: "D. Phán đoán chủ quan",
    method:
      "Tiêu chí mang tính định tính, máy chỉ gợi ý — kết luận cuối cùng luôn cần người thẩm định.",
    expectedConfidence: "dưới 55%",
    dot: "bg-group-d",
    badge: "bg-group-d/15 text-group-d",
  },
};

export const CHECK_TYPE_ORDER: readonly CheckType[] = ["A", "B", "C", "D"];

/* -------------------------------------------------------------------------- */
/* Loại nhà                                                                    */
/* -------------------------------------------------------------------------- */

export const HOUSE_TYPE_CONFIG: Record<
  HouseType,
  { label: string; short: string }
> = {
  shophouse: { label: "Shophouse", short: "SH" },
  townhouse: { label: "Townhouse / Nhà phố liên kế", short: "TH" },
  "semi-villa": { label: "Semi Villa", short: "SV" },
  "single-villa": { label: "Single Villa", short: "SGV" },
  "shop-villa": { label: "Shop Villa", short: "SHV" },
};

export const HOUSE_TYPE_ORDER: readonly HouseType[] = [
  "shophouse",
  "townhouse",
  "semi-villa",
  "single-villa",
  "shop-villa",
];

/**
 * Nhãn gọn cho phạm vi áp dụng, dùng viết tắt để cột không bị lõm:
 * đủ 5 loại thì gọi là "Mọi loại nhà", còn lại là "TH, SV, SGV".
 */
export function houseTypeScopeLabel(houseTypes: readonly HouseType[]): string {
  if (houseTypes.length >= HOUSE_TYPE_ORDER.length) return "Mọi loại nhà";
  return HOUSE_TYPE_ORDER.filter((h) => houseTypes.includes(h))
    .map((h) => HOUSE_TYPE_CONFIG[h].short)
    .join(", ");
}

/** Tên đầy đủ, dùng trong khung chú thích. */
export function houseTypeFullLabel(houseTypes: readonly HouseType[]): string {
  return HOUSE_TYPE_ORDER.filter((h) => houseTypes.includes(h))
    .map((h) => HOUSE_TYPE_CONFIG[h].label)
    .join(" · ");
}

/* -------------------------------------------------------------------------- */
/* Phép so sánh                                                                */
/* -------------------------------------------------------------------------- */

export const OPERATOR_CONFIG: Record<
  ComparisonOperator,
  { label: string; symbol: string }
> = {
  gte: { label: "Tối thiểu (≥)", symbol: "≥" },
  lte: { label: "Tối đa (≤)", symbol: "≤" },
  eq: { label: "Bằng đúng (=)", symbol: "=" },
  between: { label: "Trong khoảng", symbol: "↔" },
  "in-list": { label: "Thuộc danh sách", symbol: "∈" },
  pattern: { label: "Khớp mẫu", symbol: "≈" },
  required: { label: "Phải có", symbol: "✓" },
  forbidden: { label: "Không được có", symbol: "✕" },
};

export const OPERATOR_ORDER: readonly ComparisonOperator[] = [
  "gte",
  "lte",
  "eq",
  "between",
  "in-list",
  "pattern",
  "required",
  "forbidden",
];
