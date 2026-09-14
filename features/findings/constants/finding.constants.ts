import {
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  QuestionIcon,
  ShieldCheckIcon,
  XIcon,
} from "@/shared/components/icons";
import type {
  FindingSeverity,
  FindingStatus,
} from "@/shared/constants/enums";

type IconComponent = (props: { className?: string }) => React.ReactElement;

/* -------------------------------------------------------------------------- */
/* Trạng thái tiêu chí                                                         */
/* -------------------------------------------------------------------------- */

export const STATUS_CONFIG: Record<
  FindingStatus,
  { label: string; Icon: IconComponent; badge: string; bar: string; border: string }
> = {
  pass: {
    label: "Đạt",
    Icon: CheckIcon,
    badge: "bg-pass-subtle text-pass-text",
    bar: "bg-pass",
    border: "border-l-pass",
  },
  fail: {
    label: "Không đạt",
    Icon: XIcon,
    badge: "bg-fail-subtle text-fail-text",
    bar: "bg-fail",
    border: "border-l-fail",
  },
  warning: {
    label: "Cảnh báo",
    Icon: AlertTriangleIcon,
    badge: "bg-warning-subtle text-warning-text",
    bar: "bg-warning",
    border: "border-l-warning",
  },
  pending: {
    label: "Chờ người thẩm định",
    Icon: ClockIcon,
    badge: "bg-pending-subtle text-pending-text",
    bar: "bg-pending",
    border: "border-l-pending",
  },
  approved: {
    label: "Đã duyệt",
    Icon: ShieldCheckIcon,
    badge: "bg-approved-subtle text-approved-text",
    bar: "bg-approved",
    border: "border-l-approved",
  },
  unknown: {
    label: "Không xác định",
    Icon: QuestionIcon,
    badge: "bg-unknown-subtle text-unknown-text",
    bar: "bg-unknown",
    border: "border-l-unknown",
  },
};

/** Thứ tự hiển thị trên thanh lọc — nặng trước, đã xong sau. */
export const STATUS_ORDER: readonly FindingStatus[] = [
  "fail",
  "warning",
  "pending",
  "pass",
  "approved",
  "unknown",
];

/* -------------------------------------------------------------------------- */
/* Mức độ                                                                      */
/* -------------------------------------------------------------------------- */

export const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; badge: string; bar: string }
> = {
  low: { label: "Thấp", badge: "bg-sev-low-subtle text-sev-low-text", bar: "bg-sev-low" },
  medium: {
    label: "Trung bình",
    badge: "bg-sev-medium-subtle text-sev-medium-text",
    bar: "bg-sev-medium",
  },
  high: { label: "Cao", badge: "bg-sev-high-subtle text-sev-high-text", bar: "bg-sev-high" },
  critical: {
    label: "Nghiêm trọng",
    badge: "bg-sev-critical-subtle text-sev-critical-text",
    bar: "bg-sev-critical",
  },
};

export const SEVERITY_ORDER: readonly FindingSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

/* -------------------------------------------------------------------------- */
/* Loại kiểm tra & nhóm CHTK — nguồn sự thật ở shared/constants/domain.ts      */
/* -------------------------------------------------------------------------- */

export {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  categoryFromRuleIndex,
} from "@/shared/constants/domain";

/** @deprecated Dùng CHECK_TYPE_CONFIG trong shared/constants/domain.ts. */
export { CHECK_TYPE_CONFIG as GROUP_CONFIG } from "@/shared/constants/domain";

/** Dưới ngưỡng này thì kết luận của máy phải được người xác nhận. */
export const CONFIDENCE_THRESHOLD = 0.8;

/* -------------------------------------------------------------------------- */
/* Mô tả cho khung chú thích khi hover                                         */
/* -------------------------------------------------------------------------- */

export const STATUS_DESCRIPTION: Record<FindingStatus, string> = {
  pass: "Máy đối chiếu thấy giá trị trên bản vẽ nằm trong tiêu chuẩn áp dụng.",
  fail: "Giá trị trên bản vẽ lệch khỏi tiêu chuẩn áp dụng. Cần chỉnh bản vẽ.",
  warning:
    "Có dấu hiệu lệch nhưng chưa đủ chắc chắn — thường do độ tin cậy trích xuất thấp hoặc ghi chú mơ hồ.",
  pending: "Đã có kết luận sơ bộ, đang chờ người thẩm định xác nhận.",
  approved: "Người thẩm định đã xem và xác nhận kết luận của máy.",
  unknown:
    "Không trích xuất được dữ liệu để đối chiếu — bản vẽ thiếu thông tin hoặc ảnh không đọc được.",
};

export const SEVERITY_DESCRIPTION: Record<FindingSeverity, string> = {
  low: "Sai lệch nhỏ, không ảnh hưởng an toàn hay công năng.",
  medium: "Ảnh hưởng công năng hoặc thẩm mỹ, cần chỉnh trước khi triển khai.",
  high: "Ảnh hưởng đáng kể tới công năng hoặc chi phí thi công.",
  critical: "Liên quan an toàn hoặc quy chuẩn bắt buộc — phải xử lý trước tiên.",
};

/** Trạng thái thu gọn sẵn khi mở trang — ưu tiên đọc phần cần xử lý trước. */
export const COLLAPSED_BY_DEFAULT: readonly FindingStatus[] = [
  "pass",
  "approved",
  "unknown",
];
