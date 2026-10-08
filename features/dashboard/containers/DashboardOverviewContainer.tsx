"use client";

import { ErrorState, errorDetail } from "@/shared/components/ErrorState";
import { Skeleton, SkeletonBlock } from "@/shared/components/Skeleton";
import { CheckTypeBreakdownChart } from "../components/CheckTypeBreakdownChart";
import { GroupPassRateChart } from "../components/GroupPassRateChart";
import { KpiCard } from "../components/KpiCard";
import { PriorityFindingList } from "../components/PriorityFindingList";
import { RecentReviewList } from "../components/RecentReviewList";
import { SectionCard } from "../components/SectionCard";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

/** Màu của con số tỷ lệ phụ thuộc chính giá trị đó. */
function passRateTone(percent: number): string {
  if (percent < 50) return "text-fail-text";
  if (percent < 80) return "text-warning-text";
  return "text-pass-text";
}

/** Khung chờ giữ đúng bốn hàng của dashboard thật, để bố cục không nhảy khi dữ liệu về. */
function DashboardSkeleton() {
  return (
    <SkeletonBlock label="Đang tải số liệu tổng quan…" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-64 w-full" />
    </SkeletonBlock>
  );
}

export function DashboardOverviewContainer({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const { data, isPending, isError, error, refetch } =
    useDashboardSummary(workspaceSlug);

  const header = (
    <header className="space-y-1">
      <h1 className="text-xl font-semibold tracking-tight text-text-primary">
        Bảng điều khiển
      </h1>
      <p className="text-sm text-text-muted">
        Tổng quan chất lượng hồ sơ đang thẩm định và những mục cần người xử lý.
      </p>
    </header>
  );

  if (isPending) {
    return (
      <div className="space-y-6">
        {header}
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          message="Không tải được số liệu tổng quan."
          detail={errorDetail(error)}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const { summary, priorityFindings, recentReviews } = data;

  return (
    <div className="space-y-6">
      {header}

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
      <RecentReviewList reviews={recentReviews} workspaceSlug={workspaceSlug} />
    </div>
  );
}
