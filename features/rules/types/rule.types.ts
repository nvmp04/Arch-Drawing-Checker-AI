import type {
  CheckType,
  ChtkCategory,
  ComparisonOperator,
  HouseType,
} from "@/shared/constants/enums";

/**
 * Kiểu của feature rules — **khớp entity của backend**, không phải hình dạng
 * mong muốn của giao diện. Đã kiểm bằng file CHTK thật (92 tiêu chí, sheet
 * "4 SAO") qua `POST /workspaces/:slug/rules/import`.
 *
 * Điểm dễ vấp: rất nhiều trường là `null` trong dữ liệu thật, vì Excel không
 * có đủ cột. Trên file mẫu: `code` null 41/92, `checkType` null **92/92**,
 * `operator`/`value` null 62/92. Vì vậy thứ luôn có và luôn đọc được là
 * `title` + `requirement`, không phải `operator` + `value`.
 */

/** Một cảnh báo khi backend đọc một dòng Excel. Không chặn việc nạp. */
export type RuleSetWarning = {
  /** Dòng trong sheet Excel, để người dùng mở file ra đối chiếu. */
  sourceRow: number;
  /** UPPER_SNAKE, ví dụ `DUPLICATE_CODE`, `UNKNOWN_HOUSE_TYPE`. */
  code: string;
  /** Tiếng Việt, hiển thị thẳng được. */
  message: string;
};

export type Rule = {
  id: string;
  ruleSetId: string;
  /**
   * Mã tiêu chí, ví dụ "1.3.1". **`null` với dòng biến thể theo loại nhà** —
   * trong Excel những dòng này nằm dưới một mã cha và không có mã riêng.
   * Khi `null` thì định danh hiển thị là `parentCode` + `headings`.
   */
  code: string | null;
  parentCode: string | null;
  /** Đường dẫn tiêu đề dẫn tới dòng này, từ ngoài vào trong. */
  headings: readonly string[];
  title: string;
  /** Backend suy từ `code`/`parentCode` — luôn có. */
  category: ChtkCategory;
  /** `null` cho tới khi có bước phân loại (AI hoặc người). Excel không có cột này. */
  checkType: CheckType | null;
  /** Chỉ điền khi đọc được chắc chắn từ nguyên văn tiêu chuẩn. */
  operator: ComparisonOperator | null;
  value: string | null;
  /** Nguyên văn cột "Tiêu chuẩn áp dụng" — **nguồn sự thật của tiêu chí**. */
  requirement: string;
  /** `requirement` đã tách theo từng gạch đầu dòng. */
  requirementLines: readonly string[];
  /** Phạm vi áp dụng. Đủ 5 loại nghĩa là "Mọi loại nhà". */
  houseTypes: readonly HouseType[];
  isActive: boolean;
  /** Dòng nguồn trong sheet Excel. */
  sourceRow: number;
};

/** Một nhóm CHTK bên trong bộ — backend đã gom sẵn theo 5 nhóm. */
export type RuleSection = {
  /** "1".."5" */
  code: string;
  category: ChtkCategory;
  title: string;
  ruleCount: number;
  rules: readonly Rule[];
};

/**
 * Tóm tắt một bộ tiêu chuẩn CHTK — đủ để đổ vào dropdown chọn bộ.
 *
 * Một bộ = **một sheet** của một file Excel đã nạp. Nạp một file nhiều sheet
 * sẽ tạo ra nhiều bộ cùng lúc.
 */
export type StandardSet = {
  id: string;
  name: string;
  /** Tên file Excel đã nạp. */
  fileName: string;
  /** Tên sheet trong file đó. */
  sheetName: string;
  ruleCount: number;
  /** ISO 8601 UTC. */
  uploadedAt: string;
};

/** Bộ tiêu chuẩn đầy đủ: tóm tắt + nội dung + cảnh báo lúc đọc file. */
export type RuleSet = StandardSet & {
  sections: readonly RuleSection[];
  warnings: readonly RuleSetWarning[];
};

/** Bốn nhóm thuộc tính mà bộ lọc thao tác. */
export type RuleFilterState = {
  category: readonly ChtkCategory[];
  checkType: readonly CheckType[];
  houseType: readonly HouseType[];
  operator: readonly ComparisonOperator[];
};

export const EMPTY_RULE_FILTER: RuleFilterState = {
  category: [],
  checkType: [],
  houseType: [],
  operator: [],
};

/**
 * Dữ liệu nhập khi thêm một tiêu chí mới bằng tay.
 *
 * Khai tường minh chứ không `Omit<Rule, …>`: phần lớn trường của `Rule` do
 * backend sinh ra khi đọc Excel (`id`, `ruleSetId`, `parentCode`, `headings`,
 * `requirementLines`, `sourceRow`) và `category` luôn suy từ `code`. Bộ chứa
 * nằm ở URL (`POST /{ws}/rules/:ruleSetId/items`), nên cũng không có ở đây.
 */
export type CreateRuleInput = {
  code: string;
  title: string;
  checkType: CheckType | null;
  operator: ComparisonOperator | null;
  value: string | null;
  requirement: string;
  houseTypes: readonly HouseType[];
  isActive: boolean;
};
