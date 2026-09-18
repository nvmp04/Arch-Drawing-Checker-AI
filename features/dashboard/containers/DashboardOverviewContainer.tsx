import { MOCK_FINDINGS } from "@/features/findings/mocks/findings.mock";
import { MOCK_REVIEWS } from "@/features/reviews/mocks/reviews.mock";
import { MOCK_RULES } from "@/features/rules/mocks/rules.mock";
import { CheckTypeBreakdownChart } from "../components/CheckTypeBreakdownChart";
import { GroupPassRateChart } from "../components/GroupPassRateChart";
import { KpiCard } from "../components/KpiCard";
import { PriorityFindingList } from "../components/PriorityFindingList";
import { RecentReviewList } from "../components/RecentReviewList";
import { SectionCard } from "../components/SectionCard";
import {
  buildDashboardSummary,
  pickPriorityFindings,
} from "../services/dashboard.service";

/** Màu của con số tỷ lệ phụ thuộc chính giá trị đó. */
function passRateTone(percent: number): string {
  if (percent < 50) return "text-fail-text";
  if (percent < 80) return "text-warning-text";
  return "text-pass-text";
}

export function DashboardOverviewContainer({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  // MOCK — thay bằng một lời gọi API trả về DashboardSummary khi có backend.
  const summary = buildDashboardSummary({
    reviews: MOCK_REVIEWS,
    findings: MOCK_FINDINGS,
    rules: MOCK_RULES,
  });

  const priorityFindings = pickPriorityFindings({
    reviews: MOCK_REVIEWS,
    findings: MOCK_FINDINGS,
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Bảng điều khiển
        </h1>
        <p className="text-sm text-text-muted">
          Tổng quan chất lượng hồ sơ đang thẩm định và những mục cần người xử lý.
        </p>
      </header>

      {/* Hàng 1 — 4 ô số liệu */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Việc cần xử lý"
          value={summary.actionRequired}
          valueTone="text-fail-text"
          description="Gồm mục không đạt, mục phát cảnh báo và mục hệ thống chưa tự kết luận được."
          footnote="Cần người thẩm định quyết định."
        />

        <KpiCard
          label="Tỷ lệ đạt trung bình"
          value={summary.averagePassRate}
          unit="%"
          valueTone={passRateTone(summary.averagePassRate)}
          description={
            <>
              Tính trên{" "}
              <span className="numeric">{summary.passRateDenominator}</span> tiêu
              chí đã đủ dữ liệu để kết luận; các mục thiếu dữ liệu không gộp vào
              mẫu số.
            </>
          }
          footnote={
            <>
              <span className="numeric">{summary.passRateNumerator}</span> đạt
              (gồm cả mục đã duyệt).
            </>
          }
        />

        <KpiCard
          label="Tiêu chí đã kiểm tra"
          value={summary.testedCriteria}
          description={
            <>
              Tổng số tiêu chí đã quét trên{" "}
              <span className="numeric">{summary.completedReviewCount}</span> hồ
              sơ đã thẩm định xong.
            </>
          }
        />

        <KpiCard
          label="Bộ tiêu chuẩn"
          value={summary.standardLevel.replace("CHTK ", "")}
          description={
            <>
              <span className="numeric">{summary.activeRuleCount}</span>/
              <span className="numeric">{summary.totalRuleCount}</span> tiêu chí
              đang kích hoạt áp dụng.
            </>
          }
          footnote="Các cấp tiêu chuẩn khác: chưa có dữ liệu."
        />
      </div>

      {/* Hàng 2 — hai biểu đồ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard
          title="Tỷ lệ đạt theo nhóm tiêu chí"
          subtitle="Mẫu số chỉ gồm tiêu chí đã kết luận được"
        >
          <GroupPassRateChart rows={summary.groupPassRates} />
        </SectionCard>

        <SectionCard
          title="Kết luận theo loại kiểm tra"
          subtitle="Phân rã theo phương pháp đối chiếu và độ tin cậy kỳ vọng"
        >
          <CheckTypeBreakdownChart
            rows={summary.checkTypeBreakdowns}
            statusTotals={summary.statusTotals}
          />
        </SectionCard>
      </div>

      {/* Hàng 3 — tiêu chí cần làm trước */}
      <PriorityFindingList
        findings={priorityFindings}
        workspaceSlug={workspaceSlug}
      />

      {/* Hàng 4 — hồ sơ gần đây */}
      <RecentReviewList reviews={MOCK_REVIEWS} workspaceSlug={workspaceSlug} />
    </div>
  );
}
