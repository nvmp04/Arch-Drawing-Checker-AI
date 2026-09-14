import { ChevronDownIcon } from "@/shared/components/icons";
import type { FindingStatus } from "@/shared/constants/enums";
import { STATUS_CONFIG } from "../constants/finding.constants";
import type { Finding } from "../types/finding.types";
import { FindingRow } from "./FindingRow";

/**
 * Cấp 2 của cây: nhóm các tiêu chí cùng trạng thái trong một hồ sơ.
 * Thụt vào so với header hồ sơ; danh sách tiêu chí lại thụt sâu hơn nữa,
 * kèm đường dẫn dọc mang màu của trạng thái.
 */
export function StatusGroupSection({
  dossierId,
  status,
  findings,
  workspaceSlug,
  isOpen,
  onToggle,
}: {
  dossierId: string;
  status: FindingStatus;
  findings: readonly Finding[];
  workspaceSlug: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { label, Icon, badge, bar, border } = STATUS_CONFIG[status];
  const panelId = `status-panel-${dossierId}-${status}`;
  const isEmpty = findings.length === 0;

  return (
    <div className="pl-6">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left
                   transition-colors duration-150 hover:bg-surface-hover
                   focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus"
      >
        <ChevronDownIcon
          className={`size-4 shrink-0 text-text-muted transition-transform duration-150 ${
            isOpen ? "" : "-rotate-90"
          } ${isEmpty ? "opacity-40" : ""}`}
        />
        <span className={`size-1.5 shrink-0 rounded-full ${bar}`} aria-hidden />
        <span
          className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${badge}`}
        >
          <Icon className="size-3 shrink-0" />
          {label}
        </span>
        <span className="numeric text-xs text-text-muted">{findings.length}</span>
      </button>

      {isOpen && (
        <div id={panelId} className={`ml-4 border-l-2 ${border} ${isEmpty ? "opacity-60" : ""}`}>
          {isEmpty ? (
            <p className="px-4 py-3 text-sm text-text-muted">
              Không có tiêu chí nào ở trạng thái này.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {findings.map((finding) => (
                <li key={finding.id}>
                  <FindingRow finding={finding} workspaceSlug={workspaceSlug} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
