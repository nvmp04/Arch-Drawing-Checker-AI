"use client";

import { useId, useState } from "react";

import { FileSpreadsheetIcon, UploadIcon } from "@/shared/components/icons";
import { formatIsoDate } from "@/shared/utils/format";
import type { StandardSet } from "../types/rule.types";
import { ImportStandardSetModal } from "./ImportStandardSetModal";

/**
 * Thanh chọn bộ tiêu chuẩn đang xem, kèm nút nạp bộ mới.
 *
 * **Vì sao nút "Nhập bộ tiêu chuẩn" nằm ở đây chứ không cạnh "Thêm tiêu chí
 * mới":** hai nút thao tác ở hai cấp khác nhau. Nạp Excel tạo ra **cả một bộ**
 * — cùng cấp với dropdown đang chọn bộ nào. Thêm tiêu chí mới chỉ thêm **một
 * dòng bên trong bộ đang xem** — cùng cấp với thanh lọc. Để chung một hàng thì
 * người dùng không đọc ra được rằng một nút đổi cả tập dữ liệu, nút kia chỉ
 * thêm một phần tử vào tập đó.
 */
export function StandardSetBar({
  workspaceSlug,
  standardSets,
  selectedId,
  onSelect,
}: {
  workspaceSlug: string;
  standardSets: readonly StandardSet[];
  selectedId: string;
  /** Nhận cả lựa chọn của người dùng lẫn bộ vừa nạp xong từ file Excel. */
  onSelect: (standardSetId: string) => void;
}) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const selectId = useId();

  const selected = standardSets.find((set) => set.id === selectedId);

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 rounded-lg bg-surface-raised px-4 py-3 shadow-ds-small">
        <div className="min-w-0 space-y-1.5">
          <label
            htmlFor={selectId}
            className="block text-xs font-medium uppercase tracking-wide text-text-muted"
          >
            Bộ tiêu chuẩn đang xem
          </label>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {standardSets.length === 0 ? (
              /*
               * Chưa bộ nào được nạp. Dropdown rỗng không bấm được, nên thay
               * bằng một dòng chữ — nhưng nút nạp bên phải **vẫn phải còn**,
               * vì đó là lối thoát duy nhất khỏi trạng thái này.
               */
              <p className="py-2 text-sm text-text-muted">
                Chưa có bộ tiêu chuẩn nào.
              </p>
            ) : (
              <select
                id={selectId}
                value={selectedId}
                onChange={(event) => onSelect(event.target.value)}
                className="h-9 max-w-full rounded-md border border-border-default bg-surface-sunken px-3 text-sm text-text-primary
                           transition-colors duration-150 hover:border-border-strong
                           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
              >
                {standardSets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name}
                  </option>
                ))}
              </select>
            )}

            {selected && (
              <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-muted">
                <span className="inline-flex min-w-0 items-center gap-1">
                  <FileSpreadsheetIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{selected.fileName}</span>
                </span>
                <span aria-hidden>·</span>
                <span className="truncate">sheet “{selected.sheetName}”</span>
                <span aria-hidden>·</span>
                <span>
                  <span className="numeric">{selected.ruleCount}</span> tiêu chí
                </span>
                <span aria-hidden>·</span>
                <span>
                  nạp ngày{" "}
                  <span className="numeric">
                    {formatIsoDate(selected.uploadedAt)}
                  </span>
                </span>
              </p>
            )}
          </div>
        </div>

        {/*
          `ml-auto`: tên bộ đọc từ file Excel có thể rất dài và đẩy nút xuống
          hàng dưới. Khi đó `justify-between` không còn tác dụng (hàng chỉ có
          một phần tử) nên nút dạt về trái — `ml-auto` giữ nó luôn ở mép phải.
        */}
        <button
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border-default bg-surface-raised px-3
                     text-sm font-medium text-text-primary transition-colors duration-150
                     hover:border-border-strong hover:bg-surface-hover
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <UploadIcon className="size-4" />
          Nhập bộ tiêu chuẩn
        </button>
      </section>

      {isImportModalOpen && (
        <ImportStandardSetModal
          workspaceSlug={workspaceSlug}
          onImported={onSelect}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}
    </>
  );
}
