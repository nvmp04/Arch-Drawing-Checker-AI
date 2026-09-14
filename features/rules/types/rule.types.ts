import type {
  CheckType,
  ChtkCategory,
  ComparisonOperator,
  HouseType,
} from "@/shared/constants/enums";

export type Rule = {
  id: string;
  /** Mã tiêu chí, ví dụ "1.3.1". Chữ số đầu quyết định nhóm CHTK. */
  code: string;
  title: string;
  category: ChtkCategory;
  checkType: CheckType;
  operator: ComparisonOperator;
  /** Giá trị / yêu cầu chi tiết đi kèm phép so sánh. */
  value: string;
  /** Phạm vi áp dụng. Đủ 5 loại nghĩa là "Mọi loại nhà". */
  houseTypes: readonly HouseType[];
  note?: string;
  isActive: boolean;
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
