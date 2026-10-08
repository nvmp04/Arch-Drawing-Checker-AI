"use client";

import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState, errorDetail } from "@/shared/components/ErrorState";
import { SkeletonList } from "@/shared/components/Skeleton";
import { FindingList } from "../components/FindingList";
import { useFindings } from "../hooks/useFindings";

export function FindingListContainer({ workspaceSlug }: { workspaceSlug: string }) {
  const { data, isPending, isError, error, refetch } = useFindings(workspaceSlug);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Kết quả tiêu chí
        </h1>
        <p className="text-sm text-text-muted">
          Toàn bộ tiêu chí CHTK được đối chiếu, gom theo hồ sơ thẩm định rồi theo
          trạng thái. Chọn một tiêu chí để mở hồ sơ kèm vùng khoanh trên bản vẽ.
        </p>
      </header>

      {isPending ? (
        <SkeletonList rows={3} rowClassName="h-12" label="Đang tải kết quả tiêu chí…" />
      ) : isError ? (
        <ErrorState
          message="Không tải được kết quả tiêu chí."
          detail={errorDetail(error)}
          onRetry={() => void refetch()}
        />
      ) : data.dossiers.length === 0 ? (
        <div className="rounded-lg bg-surface-raised px-4 py-10 text-center shadow-ds-small">
          <EmptyState message="Chưa có hồ sơ nào được đối chiếu." />
        </div>
      ) : (
        <FindingList
          dossiers={data.dossiers}
          findings={data.findings}
          workspaceSlug={workspaceSlug}
        />
      )}
    </section>
  );
}
