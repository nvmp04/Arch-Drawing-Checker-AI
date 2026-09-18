import { EmptyState } from "@/shared/components/EmptyState";
import { FindingRow } from "@/features/findings/components/FindingRow";
import type { Finding } from "@/features/findings/types/finding.types";
import { SectionCard } from "./SectionCard";

/** Dùng lại đúng dòng tiêu chí của trang Kết quả tiêu chí. */
export function PriorityFindingList({
  findings,
  workspaceSlug,
}: {
  findings: readonly Finding[];
  workspaceSlug: string;
}) {
  return (
    <SectionCard
      title="Cần xử lý trước"
      subtitle="Xếp theo mức nghiêm trọng rồi tới độ tin cậy — chắc chắn sai thì làm trước"
      seeAllHref={`/${workspaceSlug}/findings`}
      bodyClassName=""
    >
      {findings.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <EmptyState message="Không có tiêu chí nào ở mức Cao hoặc Nghiêm trọng." />
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {findings.map((finding) => (
            <li key={finding.id}>
              <FindingRow finding={finding} workspaceSlug={workspaceSlug} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
