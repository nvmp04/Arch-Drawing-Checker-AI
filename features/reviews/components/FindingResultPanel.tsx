"use client";

import { useMemo, useState } from "react";

import type { Finding } from "@/features/findings/types/finding.types";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  EMPTY_STATUS_COUNTS,
  StatusLegend,
  StatusStackedBar,
  totalOf,
} from "@/shared/components/StatusStackedBar";
import {
  ACTION_REQUIRED_STATUSES,
  PASSED_STATUSES,
  SEVERITY_ORDER,
  STATUS_ORDER,
} from "@/shared/constants/domain";
import type { FindingStatus } from "@/shared/constants/enums";
import { FindingResultCard } from "./FindingResultCard";

type ResultTab = "action" | "all" | "passed";

const TABS: readonly { key: ResultTab; label: string }[] = [
  { key: "action", label: "Cần xử lý" },
  { key: "all", label: "Tất cả" },
  { key: "passed", label: "Đạt" },
];

/** Màu của con số tỷ lệ phụ thuộc chính giá trị đó. */
function passRateTone(percent: number): string {
  if (percent < 50) return "text-fail-text";
  if (percent < 80) return "text-warning-text";
  return "text-pass-text";
}

function sortFindings(findings: readonly Finding[]): readonly Finding[] {
  return [...findings].sort((a, b) => {
    const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (byStatus !== 0) return byStatus;
    const bySeverity = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    if (bySeverity !== 0) return bySeverity;
    return a.ruleIndex.localeCompare(b.ruleIndex, "vi", { numeric: true });
  });
}

/**
 * Khung "Kết quả thẩm định" bên phải: thanh phân rã trạng thái + 3 tab
 * (Cần xử lý / Tất cả / Đạt). Chọn một thẻ đồng bộ ngược sang khung xem bản vẽ
 * qua `onSelectFinding` — component cha giữ state lựa chọn dùng chung.
 */
export function FindingResultPanel({
  findings,
  selectedFindingId,
  onSelectFinding,
  onConfirmFinding,
  onSaveNote,
}: {
  findings: readonly Finding[];
  selectedFindingId?: string;
  onSelectFinding: (id: string) => void;
  onConfirmFinding: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
}) {
  const [tab, setTab] = useState<ResultTab>("action");

  const statusCounts = useMemo(() => {
    const counts = { ...EMPTY_STATUS_COUNTS } as Record<FindingStatus, number>;
    for (const finding of findings) counts[finding.status] += 1;
    return counts;
  }, [findings]);

  const concluded = totalOf(statusCounts) - statusCounts.unknown;
  const passed = PASSED_STATUSES.reduce((sum, s) => sum + statusCounts[s], 0);
  const passRate = concluded > 0 ? Math.round((passed / concluded) * 100) : 0;

  const visible = useMemo(() => {
    const filtered =
      tab === "all"
        ? findings
        : tab === "action"
          ? findings.filter((f) => ACTION_REQUIRED_STATUSES.includes(f.status))
          : findings.filter((f) => PASSED_STATUSES.includes(f.status));
    return sortFindings(filtered);
  }, [findings, tab]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-surface-raised shadow-ds-small">
      <div className="shrink-0 space-y-3 border-b border-border-subtle p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Kết quả thẩm định
          </h2>
          <p className="flex items-baseline gap-1.5">
            <span className="text-xs text-text-muted">Đạt</span>
            <span className={`numeric text-base font-semibold ${passRateTone(passRate)}`}>
              {concluded > 0 ? `${passRate}%` : "——"}
            </span>
          </p>
        </div>
        <StatusStackedBar counts={statusCounts} />
        <StatusLegend counts={statusCounts} />
        <p className="text-xs leading-relaxed text-text-muted">
          <span className="numeric">{passed}</span>/<span className="numeric">{concluded}</span>{" "}
          tiêu chí đã kết luận được là đạt (gồm cả mục đã duyệt); không tính{" "}
          <span className="numeric">{statusCounts.unknown}</span> mục không xác định.
        </p>

        <div role="tablist" aria-label="Lọc kết quả thẩm định" className="flex gap-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              data-active={tab === key}
              onClick={() => setTab(key)}
              className="flex-1 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors duration-150
                         hover:bg-surface-hover hover:text-text-primary
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                         data-[active=true]:bg-surface-active data-[active=true]:font-medium data-[active=true]:text-text-primary"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden p-3">
        {visible.length === 0 ? (
          <div className="px-2 py-10 text-center">
            <EmptyState message="Không có tiêu chí nào trong mục này." />
          </div>
        ) : (
          visible.map((finding) => (
            <FindingResultCard
              key={finding.id}
              finding={finding}
              isSelected={finding.id === selectedFindingId}
              onSelect={() => onSelectFinding(finding.id)}
              onConfirm={() => onConfirmFinding(finding.id)}
              onSaveNote={(note) => onSaveNote(finding.id, note)}
            />
          ))
        )}
      </div>
    </div>
  );
}
