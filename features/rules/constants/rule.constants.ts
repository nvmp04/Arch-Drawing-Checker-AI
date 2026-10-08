import type { FilterGroup } from "@/shared/components/CascadingFilterMenu";
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  CHECK_TYPE_CONFIG,
  CHECK_TYPE_ORDER,
  HOUSE_TYPE_CONFIG,
  HOUSE_TYPE_ORDER,
  OPERATOR_CONFIG,
  OPERATOR_ORDER,
} from "@/shared/constants/domain";

/** Khóa nhóm của bộ lọc — trùng tên trường trong RuleFilterState. */
export const FILTER_GROUP_KEYS = [
  "category",
  "checkType",
  "houseType",
  "operator",
] as const;

export type RuleFilterGroupKey = (typeof FILTER_GROUP_KEYS)[number];

/** Bốn nhóm ở menu cấp 1, kèm danh sách giá trị ở cấp 2. */
export const RULE_FILTER_GROUPS: readonly FilterGroup[] = [
  {
    key: "category",
    label: "Nhóm CHTK",
    options: CATEGORY_ORDER.map((value) => ({
      value,
      prefix: `${CATEGORY_CONFIG[value].section}.`,
      label: CATEGORY_CONFIG[value].label,
      dot: CATEGORY_CONFIG[value].dot,
    })),
  },
  {
    key: "checkType",
    label: "Loại kiểm tra",
    options: CHECK_TYPE_ORDER.map((value) => ({
      value,
      prefix: `${value}.`,
      label: CHECK_TYPE_CONFIG[value].label,
      dot: CHECK_TYPE_CONFIG[value].dot,
    })),
  },
  {
    key: "houseType",
    label: "Loại nhà",
    options: HOUSE_TYPE_ORDER.map((value) => ({
      value,
      label: HOUSE_TYPE_CONFIG[value].label,
    })),
  },
  {
    key: "operator",
    label: "Phép so sánh",
    options: OPERATOR_ORDER.map((value) => ({
      value,
      label: OPERATOR_CONFIG[value].label,
    })),
  },
];

/** Nhãn nhóm dùng cho chip bộ lọc đang bật. */
export const FILTER_GROUP_LABEL: Record<RuleFilterGroupKey, string> = {
  category: "Nhóm CHTK",
  checkType: "Loại kiểm tra",
  houseType: "Loại nhà",
  operator: "Phép so sánh",
};

/** Nhãn của một giá trị bất kỳ, để hiển thị trên chip. */
export function filterValueLabel(
  groupKey: RuleFilterGroupKey,
  value: string,
): string {
  switch (groupKey) {
    case "category":
      return CATEGORY_CONFIG[value as keyof typeof CATEGORY_CONFIG].label;
    case "checkType":
      return CHECK_TYPE_CONFIG[value as keyof typeof CHECK_TYPE_CONFIG].title;
    case "houseType":
      return HOUSE_TYPE_CONFIG[value as keyof typeof HOUSE_TYPE_CONFIG].label;
    case "operator":
      return OPERATOR_CONFIG[value as keyof typeof OPERATOR_CONFIG].label;
  }
}

/* -------------------------------------------------------------------------
 * Nạp bộ tiêu chuẩn từ file Excel
 * ---------------------------------------------------------------------- */

/**
 * Giá trị cho thuộc tính `accept` của input file.
 *
 * Liệt kê cả MIME type lẫn đuôi file là có chủ đích: Windows đôi khi báo MIME
 * rỗng hoặc `application/octet-stream` cho `.xlsx`, khi đó chỉ còn đuôi file là
 * căn cứ. Đây chỉ là gợi ý cho hộp thoại chọn file — vẫn phải kiểm lại trong code.
 */
export const STANDARD_SET_UPLOAD_ACCEPT =
  ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Đuôi file được nhận. Đây mới là phép kiểm thật, không tin vào MIME type.
 *
 * **Chỉ `.xlsx`.** Backend đọc file bằng exceljs và trả `415
 * UNSUPPORTED_MEDIA_TYPE` — "Chỉ nhận file Excel .xlsx (không nhận .xls,
 * .csv)" — nên nhận `.xls` ở client chỉ để người dùng chờ rồi bị từ chối.
 */
export const STANDARD_SET_FILE_EXTENSIONS = [".xlsx"] as const;

/** Khớp `MAX_EXCEL_UPLOAD_MB` bên backend. Vượt ngưỡng backend trả `413`. */
export const MAX_STANDARD_SET_FILE_SIZE_MB = 10;

/**
 * Gợi ý hành động thêm cho vài mã lỗi của backend.
 *
 * `error.message` của backend đã là tiếng Việt hiển thị thẳng được
 * (conventions §4), nên **không thay thế** nó — chỉ nối thêm câu chỉ việc phải
 * làm khi câu gốc chưa nói.
 */
export const IMPORT_ERROR_HINTS: Readonly<Record<string, string>> = {
  EXCEL_HEADER_NOT_FOUND:
    'Sheet cần có dòng tiêu đề gồm "STT", "TIÊU CHÍ…" và "TIÊU CHUẨN ÁP DỤNG".',
  EXCEL_UNREADABLE:
    "Thử mở lại bằng Excel rồi lưu dạng .xlsx, hoặc kiểm tra file có bị hỏng khi tải về không.",
  PAYLOAD_TOO_LARGE: `Giới hạn ${MAX_STANDARD_SET_FILE_SIZE_MB}MB cho mỗi file.`,
};

/* -------------------------------------------------------------------------
 * Hiển thị tiêu chí có trường rỗng
 * ---------------------------------------------------------------------- */

/**
 * Nhãn định danh một tiêu chí khi hiển thị.
 *
 * Dòng biến thể theo loại nhà trong Excel **không có mã riêng** (`code: null`,
 * 41/92 dòng trong file CHTK thật) — khi đó định danh là mã cha. Dùng cho
 * `aria-label`, `title` và mọi chỗ cần một chuỗi nhận diện.
 */
export function ruleDisplayCode(rule: {
  code: string | null;
  parentCode: string | null;
  title: string;
}): string {
  return rule.code ?? rule.parentCode ?? rule.title;
}

/** Đường dẫn tiêu đề dẫn tới một dòng biến thể, ví dụ "Tường xây › Trát vữa". */
export function headingTrail(headings: readonly string[]): string {
  return headings.join(" › ");
}
