/**
 * Nguồn sự thật của các hằng số miền nằm ở `shared/constants/domain.ts`
 * (findings, rules và dashboard đều dùng chung). File này chỉ re-export
 * cho code trong feature findings, cộng thêm vài hằng số riêng của trang.
 */
export {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  categoryFromRuleIndex,
  CHECK_TYPE_CONFIG,
  CHECK_TYPE_CONFIG as GROUP_CONFIG,
  CONFIDENCE_THRESHOLD,
  SEVERITY_CONFIG,
  SEVERITY_ORDER,
  STATUS_CONFIG,
  STATUS_ORDER,
} from "@/shared/constants/domain";

import type { FindingStatus } from "@/shared/constants/enums";

/** Trạng thái thu gọn sẵn khi mở trang — ưu tiên đọc phần cần xử lý trước. */
export const COLLAPSED_BY_DEFAULT: readonly FindingStatus[] = [
  "pass",
  "approved",
  "unknown",
];
