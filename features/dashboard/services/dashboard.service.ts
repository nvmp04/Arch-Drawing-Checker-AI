import {
  EMPTY_STATUS_COUNTS,
  totalOf,
  type StatusCounts,
} from "@/shared/components/StatusStackedBar";
import {
  ACTION_REQUIRED_STATUSES,
  CATEGORY_ORDER,
  CHECK_TYPE_ORDER,
  PASSED_STATUSES,
  SEVERITY_ORDER,
} from "@/shared/constants/domain";
import type { FindingStatus } from "@/shared/constants/enums";
import type { Finding } from "@/features/findings/types/finding.types";
import type { Review } from "@/features/reviews/types/review.types";
import type { Rule } from "@/features/rules/types/rule.types";
import type { DashboardSummary } from "../types/dashboard.types";

/**
 * Tổng hợp số liệu cho dashboard.
 *
 * Khi có backend thì cả khối này thay bằng một lời gọi API trả về đúng
 * `DashboardSummary` — dashboard không nên tự đọc dữ liệu thô của feature khác.
 */

function addCounts(a: StatusCounts, b: StatusCounts): StatusCounts {
  return {
    fail: a.fail + b.fail,
    warning: a.warning + b.warning,
    pending: a.pending + b.pending,
    pass: a.pass + b.pass,
    approved: a.approved + b.approved,
    unknown: a.unknown + b.unknown,
  };
}

function countByStatus(findings: readonly Finding[]): StatusCounts {
  const counts = { ...EMPTY_STATUS_COUNTS } as Record<FindingStatus, number>;
  for (const f of findings) counts[f.status] += 1;
  return counts;
}

function sumOf(counts: StatusCounts, statuses: readonly FindingStatus[]): number {
  return statuses.reduce((sum, s) => sum + counts[s], 0);
}

export function buildDashboardSummary({
  reviews,
  findings,
  rules,
  standardLevel = "CHTK Cấp 4 SAO",
}: {
  reviews: readonly Review[];
  findings: readonly Finding[];
  rules: readonly Rule[];
  standardLevel?: string;
}): DashboardSummary {
  const completed = reviews.filter((r) => r.status === "completed");

  const statusTotals = completed.reduce(
    (acc, r) => addCounts(acc, r.statusCounts),
    EMPTY_STATUS_COUNTS,
  );

  const testedCriteria = totalOf(statusTotals);
  const passRateDenominator = testedCriteria - statusTotals.unknown;
  const passRateNumerator = sumOf(statusTotals, PASSED_STATUSES);

  // Biểu đồ theo nhóm và theo loại kiểm tra cần dữ liệu tiêu chí chi tiết,
  // hiện chỉ có ở hồ sơ đã mock đầy đủ.
  const groupPassRates = CATEGORY_ORDER.map((category) => {
    const rows = findings.filter((f) => f.category === category);
    const counts = countByStatus(rows);
    const missing = counts.unknown;
    const concluded = rows.length - missing;
    const passed = sumOf(counts, PASSED_STATUSES);
    return {
      category,
      concluded,
      passed,
      missing,
      percent: concluded > 0 ? Math.round((passed / concluded) * 100) : 0,
    };
  });

  const checkTypeBreakdowns = CHECK_TYPE_ORDER.map((checkType) => {
    const rows = findings.filter((f) => f.group === checkType);
    return { checkType, total: rows.length, counts: countByStatus(rows) };
  });

  return {
    actionRequired: sumOf(statusTotals, ACTION_REQUIRED_STATUSES),
    averagePassRate:
      passRateDenominator > 0
        ? Math.round((passRateNumerator / passRateDenominator) * 100)
        : 0,
    passRateNumerator,
    passRateDenominator,
    testedCriteria,
    completedReviewCount: completed.length,
    standardLevel,
    activeRuleCount: rules.filter((r) => r.isActive).length,
    totalRuleCount: rules.length,
    groupPassRates,
    checkTypeBreakdowns,
    statusTotals,
  };
}

/**
 * Mười tiêu chí cần làm trước: chỉ lấy mức Cao và Nghiêm trọng, duyệt lần lượt
 * từng hồ sơ cho tới khi đủ 10. Trong mỗi hồ sơ, nặng trước rồi tới chắc chắn
 * trước — cùng mức độ thì độ tin cậy cao lên đầu.
 */
export function pickPriorityFindings({
  reviews,
  findings,
  limit = 10,
}: {
  reviews: readonly Review[];
  findings: readonly Finding[];
  limit?: number;
}): readonly Finding[] {
  const picked: Finding[] = [];

  for (const review of reviews) {
    if (picked.length >= limit) break;

    const candidates = findings
      .filter(
        (f) =>
          f.reviewId === review.id &&
          (f.severity === "critical" || f.severity === "high"),
      )
      .sort((a, b) => {
        const bySeverity =
          SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
        if (bySeverity !== 0) return bySeverity;
        return b.confidence - a.confidence;
      });

    picked.push(...candidates.slice(0, limit - picked.length));
  }

  return picked;
}
