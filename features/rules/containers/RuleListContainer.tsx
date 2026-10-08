"use client";

import { useState } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState, errorDetail } from "@/shared/components/ErrorState";
import { Skeleton, SkeletonBlock, SkeletonList } from "@/shared/components/Skeleton";
import { RuleList } from "../components/RuleList";
import { StandardSetBar } from "../components/StandardSetBar";
import { useRules } from "../hooks/useRules";
import { useStandardSets } from "../hooks/useStandardSets";

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-surface-raised px-4 py-10 text-center shadow-ds-small">
      <EmptyState message={message} />
    </div>
  );
}

export function RuleListContainer({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const standardSetsQuery = useStandardSets(workspaceSlug);

  /**
   * `null` nghĩa là người dùng chưa tự chọn — khi đó lấy bộ đầu danh sách.
   *
   * Suy ra bằng biểu thức chứ không đồng bộ bằng `useEffect`: đặt state trong
   * effect vừa thừa một lần render, vừa bị ESLint chặn
   * (`react-hooks/set-state-in-effect`).
   */
  const [chosenId, setChosenId] = useState<string | null>(null);
  const activeId = chosenId ?? standardSetsQuery.data?.[0]?.id ?? "";

  const rulesQuery = useRules(workspaceSlug, activeId);

  const header = (
    <header className="space-y-1">
      <h1 className="text-xl font-semibold tracking-tight text-text-primary">
        Tiêu chuẩn CHTK
      </h1>
      <p className="text-sm text-text-muted">
        Nội dung của một bộ tiêu chuẩn đã nạp từ Excel. Lọc theo nhóm CHTK, loại
        kiểm tra, loại nhà và phép so sánh; tắt công tắc để tạm ngưng áp dụng
        một quy tắc.
      </p>
    </header>
  );

  if (standardSetsQuery.isPending) {
    return (
      <section className="space-y-4">
        {header}
        <SkeletonBlock label="Đang tải danh sách bộ tiêu chuẩn…" className="space-y-4">
          <Skeleton className="h-[72px] w-full" />
          <Skeleton className="h-9 w-full" />
        </SkeletonBlock>
      </section>
    );
  }

  if (standardSetsQuery.isError) {
    return (
      <section className="space-y-4">
        {header}
        <ErrorState
          message="Không tải được danh sách bộ tiêu chuẩn."
          detail={errorDetail(standardSetsQuery.error)}
          onRetry={() => void standardSetsQuery.refetch()}
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {header}

      <StandardSetBar
        workspaceSlug={workspaceSlug}
        standardSets={standardSetsQuery.data}
        selectedId={activeId}
        onSelect={setChosenId}
      />

      {standardSetsQuery.data.length === 0 ? (
        <EmptyCard message="Chưa có bộ tiêu chuẩn nào — nhập một file Excel để bắt đầu. Máy chủ chưa lưu bộ đã nạp, nên tải lại trang là phải nhập lại." />
      ) : rulesQuery.isPending ? (
        <SkeletonList rows={6} rowClassName="h-10" label="Đang tải tiêu chí…" />
      ) : rulesQuery.isError ? (
        <ErrorState
          message="Không tải được tiêu chí của bộ này."
          detail={errorDetail(rulesQuery.error)}
          onRetry={() => void rulesQuery.refetch()}
        />
      ) : rulesQuery.data.length === 0 ? (
        <EmptyCard message="Bộ tiêu chuẩn này chưa có tiêu chí nào." />
      ) : (
        /*
         * `key` để đổi bộ là dựng lại `RuleList` từ đầu: nó giữ danh sách tiêu
         * chí, bộ lọc và các công tắc trong state cục bộ, mà state khởi tạo từ
         * prop thì không tự cập nhật khi prop đổi. Dựng lại cũng đúng về nghĩa
         * — bộ lọc của bộ cũ không còn ý nghĩa với bộ mới.
         */
        <RuleList key={activeId} ruleSetId={activeId} rules={rulesQuery.data} />
      )}
    </section>
  );
}
