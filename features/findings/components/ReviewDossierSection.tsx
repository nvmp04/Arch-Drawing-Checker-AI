import { ChevronDownIcon } from "@/shared/components/icons";
import type { FindingStatus } from "@/shared/constants/enums";
import { STATUS_CONFIG, STATUS_ORDER } from "../constants/finding.constants";
import type { Finding, ReviewDossier } from "../types/finding.types";
import { StatusGroupSection } from "./StatusGroupSection";

/**
 * Cấp 1 của cây: một hồ sơ thẩm định. Luôn liệt kê đủ 6 trạng thái,
 * kể cả trạng thái không có tiêu chí nào, để người đọc biết hồ sơ đã phủ hết.
 */
export function ReviewDossierSection({
  dossier,
  findings,
  workspaceSlug,
  isOpen,
  onToggle,
  isStatusOpen,
  onToggleStatus,
}: {
  dossier: ReviewDossier;
  findings: readonly Finding[];
  workspaceSlug: string;
  isOpen: boolean;
  onToggle: () => void;
  isStatusOpen: (status: FindingStatus) => boolean;
  onToggleStatus: (status: FindingStatus) => void;
}) {
  const panelId = `dossier-panel-${dossier.id}`;

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    items: findings.filter((f) => f.status === status),
  }));

  const failCount = byStatus.find((g) => g.status === "fail")?.items.length ?? 0;

  return (
    // Không dùng overflow-hidden: khung chú thích của dòng đầu tiên nằm phía
    // trên phần tử và sẽ bị cắt mất.
    <section className="rounded-lg bg-surface-raised shadow-ds-small">
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={`flex w-full items-center gap-3 rounded-t-lg px-4 py-3 text-left
                      transition-colors duration-150 hover:bg-surface-hover
                      focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus
                      ${isOpen ? "" : "rounded-b-lg"}`}
        >
          <ChevronDownIcon
            className={`size-4 shrink-0 text-text-muted transition-transform duration-150 ${
              isOpen ? "" : "-rotate-90"
            }`}
          />
          <span className="numeric shrink-0 text-sm font-medium text-text-primary">
            {dossier.code}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-text-secondary">
            {dossier.name}
          </span>

          <span className="flex shrink-0 items-center gap-3">
            {/* Chấm màu + số lượng theo trạng thái, quét nhanh khi đã thu gọn */}
            <span className="hidden items-center gap-2 md:flex">
              {byStatus
                .filter((g) => g.items.length > 0)
                .map(({ status, items }) => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1"
                    title={`${STATUS_CONFIG[status].label}: ${items.length}`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${STATUS_CONFIG[status].bar}`}
                      aria-hidden
                    />
                    <span className="numeric text-xs text-text-muted">
                      {items.length}
                    </span>
                  </span>
                ))}
            </span>
            <span className="text-xs text-text-muted">
              <span className="numeric">{findings.length}</span> tiêu chí
              {failCount > 0 && (
                <>
                  {" · "}
                  <span className="text-fail-text">
                    <span className="numeric">{failCount}</span> không đạt
                  </span>
                </>
              )}
            </span>
          </span>
        </button>
      </h2>

      {isOpen && (
        <div id={panelId} className="space-y-0.5 pb-2">
          {byStatus.map(({ status, items }) => (
            <StatusGroupSection
              key={status}
              dossierId={dossier.id}
              status={status}
              findings={items}
              workspaceSlug={workspaceSlug}
              isOpen={isStatusOpen(status)}
              onToggle={() => onToggleStatus(status)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
