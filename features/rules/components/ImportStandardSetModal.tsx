"use client";

import { useId, useRef, useState } from "react";

import { Modal } from "@/shared/components/Modal";
import {
  AlertTriangleIcon,
  CheckIcon,
  FileSpreadsheetIcon,
  UploadIcon,
  XIcon,
} from "@/shared/components/icons";
import { ApiError } from "@/shared/services/apiClient";
import { formatFileSize } from "@/shared/utils/format";
import {
  IMPORT_ERROR_HINTS,
  MAX_STANDARD_SET_FILE_SIZE_MB,
  STANDARD_SET_FILE_EXTENSIONS,
  STANDARD_SET_UPLOAD_ACCEPT,
} from "../constants/rule.constants";
import { useImportStandardSet } from "../hooks/useImportStandardSet";
import type { RuleSet } from "../types/rule.types";

/**
 * Kiểm file trước khi gửi đi.
 *
 * Căn cứ là **đuôi file**, không phải `file.type`: Windows trả MIME rỗng hoặc
 * `application/octet-stream` cho `.xlsx` tùy máy có cài Office hay không, nên
 * lọc theo MIME sẽ chặn nhầm file hợp lệ.
 *
 * Đây chỉ là lớp chặn cho đỡ mất công gửi đi rồi mới biết sai — backend vẫn
 * kiểm lại bằng magic bytes, vì không gì ngăn người dùng đổi tên `.txt` thành
 * `.xlsx`.
 */
function validationErrorOf(file: File): string | null {
  const name = file.name.toLowerCase();
  const hasValidExtension = STANDARD_SET_FILE_EXTENSIONS.some((ext) =>
    name.endsWith(ext),
  );

  if (!hasValidExtension) {
    return `Chỉ nhận file Excel ${STANDARD_SET_FILE_EXTENSIONS.join(", ")} (không nhận .xls, .csv).`;
  }
  if (file.size === 0) {
    return "File rỗng.";
  }
  if (file.size > MAX_STANDARD_SET_FILE_SIZE_MB * 1024 * 1024) {
    return `File vượt quá ${MAX_STANDARD_SET_FILE_SIZE_MB}MB.`;
  }
  return null;
}

/** Câu hiển thị cho một lỗi của lời gọi nạp file. */
function importErrorMessage(error: Error): string {
  if (!(error instanceof ApiError)) return error.message;

  if (error.isNotImplemented) {
    return "Máy chủ chưa hiện thực chức năng này.";
  }

  // `message` của backend đã là tiếng Việt hiển thị được — giữ nguyên, chỉ nối
  // thêm gợi ý hành động khi có.
  const hint = IMPORT_ERROR_HINTS[error.code];
  const details = error.details.length > 0 ? ` ${error.details.join(" ")}` : "";
  return `${error.message}${details}${hint ? ` ${hint}` : ""}`;
}

function ExcelDropzone({
  file,
  onFileChange,
  onReject,
  disabled,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onReject: (message: string) => void;
  disabled: boolean;
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleFiles = (files: FileList | null) => {
    const next = files?.[0];
    if (!next) return;
    const error = validationErrorOf(next);
    if (error) onReject(error);
    else onFileChange(next);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-sunken px-4 py-3">
        <FileSpreadsheetIcon className="size-8 shrink-0 text-accent-text" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">
            {file.name}
          </p>
          <p className="numeric mt-0.5 text-xs text-text-muted">
            {formatFileSize(file.size)}
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onFileChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-fail-text
                     transition-colors duration-150 hover:bg-surface-hover
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XIcon className="size-3.5" /> Gỡ file
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={inputId}
      data-active={isDragActive}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragActive(false);
        handleFiles(event.dataTransfer.files);
      }}
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed
                 border-border-strong bg-surface-sunken px-6 py-10 text-center transition-colors duration-150
                 hover:border-accent data-[active=true]:border-accent data-[active=true]:bg-accent-subtle"
    >
      <UploadIcon className="size-8 text-text-muted" />
      <p className="text-sm text-text-secondary">
        Kéo thả file Excel vào đây, hoặc{" "}
        <span className="text-accent-text underline-offset-2 hover:underline">
          chọn file
        </span>
      </p>
      <p className="text-xs text-text-muted">
        Chỉ nhận {STANDARD_SET_FILE_EXTENSIONS.join(" / ")}, tối đa{" "}
        {MAX_STANDARD_SET_FILE_SIZE_MB}MB
      </p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={STANDARD_SET_UPLOAD_ACCEPT}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
}

/** Kết quả đọc file: mỗi sheet một bộ, kèm những dòng backend thấy đáng ngờ. */
function ImportResult({ ruleSets }: { ruleSets: readonly RuleSet[] }) {
  const warnings = ruleSets.flatMap((set) => set.warnings);

  return (
    <div className="space-y-3">
      <div role="status" className="space-y-1.5">
        <p className="flex items-start gap-2 text-sm text-pass-text">
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            Đã đọc <span className="numeric">{ruleSets.length}</span> bộ tiêu
            chuẩn từ file.
          </span>
        </p>

        <ul className="space-y-1 pl-6">
          {ruleSets.map((set) => (
            <li key={set.id} className="text-sm text-text-secondary">
              <span className="text-text-primary">{set.name}</span> —{" "}
              <span className="numeric">{set.ruleCount}</span> tiêu chí
              <span className="text-text-muted"> · sheet “{set.sheetName}”</span>
            </li>
          ))}
        </ul>
      </div>

      {warnings.length > 0 && (
        <details className="rounded-md border border-border-default bg-surface-sunken px-3 py-2">
          <summary className="cursor-pointer text-sm text-warning-text">
            <span className="numeric">{warnings.length}</span> dòng cần xem lại
          </summary>
          <ul className="mt-2 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-xs text-text-secondary">
                <span className="numeric text-text-muted">
                  Dòng {warning.sourceRow}
                </span>{" "}
                — {warning.message}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-xs text-text-muted">
        Máy chủ đọc được file nhưng <strong>chưa lưu lại</strong> — tải lại trang
        sẽ mất bộ vừa nạp.
      </p>
    </div>
  );
}

export function ImportStandardSetModal({
  workspaceSlug,
  onClose,
  onImported,
}: {
  workspaceSlug: string;
  onClose: () => void;
  /** Bộ đầu tiên đọc được, để trang chọn hiển thị luôn nó. */
  onImported: (ruleSetId: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  /** Lỗi do file người dùng chọn — tách khỏi lỗi của lời gọi mạng. */
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  const importStandardSet = useImportStandardSet(workspaceSlug);

  const errorMessage =
    rejectReason ??
    (importStandardSet.isError
      ? importErrorMessage(importStandardSet.error)
      : null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || importStandardSet.isPending) return;

    importStandardSet.mutate(file, {
      // Chọn bộ vừa nạp ngay, nhưng **không** đóng modal: kết quả đọc file và
      // danh sách cảnh báo là thứ người dùng cần đọc trước khi đi tiếp.
      onSuccess: (sets) => {
        if (sets.length > 0) onImported(sets[0].id);
      },
    });
  };

  const isDone = importStandardSet.isSuccess;

  return (
    <Modal title="Nhập bộ tiêu chuẩn từ Excel" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-muted">
          Mỗi sheet trong file Excel là một bộ tiêu chuẩn CHTK. File được gửi
          nguyên trạng lên máy chủ để đọc thành danh sách tiêu chí — trình duyệt
          không mở file.
        </p>

        <ExcelDropzone
          file={file}
          disabled={importStandardSet.isPending}
          onFileChange={(next) => {
            setFile(next);
            setRejectReason(null);
            // Chọn file khác thì bỏ kết quả của lần gửi trước, nếu không thông
            // báo cũ còn treo lại bên dưới file mới.
            importStandardSet.reset();
          }}
          onReject={(message) => {
            setFile(null);
            setRejectReason(message);
          }}
        />

        {isDone ? (
          <ImportResult ruleSets={importStandardSet.data} />
        ) : (
          errorMessage && (
            <p
              role="alert"
              className="flex items-start gap-2 text-sm text-fail-text"
            >
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md px-3 text-sm text-text-secondary
                       transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            {isDone ? "Xem bộ tiêu chuẩn" : "Hủy"}
          </button>

          {!isDone && (
            <button
              type="submit"
              disabled={!file || importStandardSet.isPending}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-text-on-accent
                         transition-colors duration-150 hover:bg-accent-hover
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UploadIcon className="size-4" />
              {importStandardSet.isPending ? "Đang gửi…" : "Gửi lên máy chủ"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
