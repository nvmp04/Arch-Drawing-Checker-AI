"use client";

import { useState } from "react";

import { ChtkCategoryTag } from "@/features/findings/components/ChtkCategoryTag";
import { ConfidenceBadge } from "@/features/findings/components/ConfidenceBadge";
import { ExtractedVsExpectedValue } from "@/features/findings/components/ExtractedVsExpectedValue";
import { FindingSeverityBadge } from "@/features/findings/components/FindingSeverityBadge";
import { FindingStatusBadge } from "@/features/findings/components/FindingStatusBadge";
import { PageReferenceLink } from "@/features/findings/components/PageReferenceLink";
import { ReasoningGroupTag } from "@/features/findings/components/ReasoningGroupTag";
import type { Finding } from "@/features/findings/types/finding.types";
import { NoteIcon, ShieldCheckIcon } from "@/shared/components/icons";

function NoteEditor({
  note,
  onSave,
}: {
  note?: string;
  onSave: (note: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? "");

  if (!isEditing) {
    return (
      <div className="space-y-1.5">
        {note && (
          <p className="rounded-md bg-surface-sunken p-2 text-xs leading-relaxed text-text-secondary">
            {note}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setDraft(note ?? "");
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-secondary
                     transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <NoteIcon className="size-3.5" />
          {note ? "Sửa ghi chú" : "Thêm ghi chú"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <textarea
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={2}
        placeholder="Ghi chú cho tiêu chí này..."
        className="w-full resize-none rounded-md border border-border-default bg-surface-sunken px-2.5 py-2 text-xs
                   text-text-primary transition-colors duration-150 placeholder:text-text-muted
                   hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onSave(draft.trim());
            setIsEditing(false);
          }}
          className="inline-flex h-7 items-center rounded-md bg-accent px-2.5 text-xs font-medium text-text-on-accent
                     transition-colors duration-150 hover:bg-accent-hover
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          Lưu ghi chú
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="inline-flex h-7 items-center rounded-md px-2.5 text-xs text-text-secondary
                     transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

/**
 * Một tiêu chí trong khung kết quả thẩm định bên phải. Chọn thẻ sẽ đồng bộ
 * sang khung xem bản vẽ (nhảy trang + zoom vào vùng khoanh) — do component cha
 * xử lý qua `onSelect`. Chỉ thẻ đang chọn mới hiện nút Xác nhận / Ghi chú, để
 * danh sách mặc định gọn.
 */
export function FindingResultCard({
  finding,
  isSelected,
  onSelect,
  onConfirm,
  onSaveNote,
}: {
  finding: Finding;
  isSelected: boolean;
  onSelect: () => void;
  onConfirm: () => void;
  onSaveNote: (note: string) => void;
}) {
  return (
    <div
      data-selected={isSelected}
      data-finding-id={finding.id}
      className="rounded-lg border border-border-subtle p-3 transition-colors duration-150
                 data-[selected=true]:border-accent data-[selected=true]:bg-accent-subtle"
    >
      <button type="button" onClick={onSelect} className="flex w-full flex-col gap-2 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="numeric text-sm text-text-secondary">{finding.ruleIndex}</span>
          <FindingStatusBadge status={finding.status} />
        </div>

        <p className="text-sm text-text-primary">{finding.detailLabel}</p>

        <ExtractedVsExpectedValue
          extractedValue={finding.extractedValue}
          standardValue={finding.standardValue}
          status={finding.status}
        />

        <div className="flex flex-wrap items-center gap-2">
          <FindingSeverityBadge severity={finding.severity} />
          <ConfidenceBadge value={finding.confidence} group={finding.group} />
          <ReasoningGroupTag group={finding.group} />
          <ChtkCategoryTag category={finding.category} />
          <PageReferenceLink pageNumber={finding.pageNumber} withTooltip={false} />
          {finding.note && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted" title="Có ghi chú">
              <NoteIcon className="size-3.5 shrink-0" />
            </span>
          )}
        </div>
      </button>

      {isSelected && (
        <div className="mt-3 space-y-3 border-t border-border-subtle pt-3">
          {finding.status !== "approved" && (
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-medium text-text-on-accent
                         transition-colors duration-150 hover:bg-accent-hover
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
            >
              <ShieldCheckIcon className="size-3.5" />
              Xác nhận
            </button>
          )}

          <NoteEditor note={finding.note} onSave={onSaveNote} />
        </div>
      )}
    </div>
  );
}
