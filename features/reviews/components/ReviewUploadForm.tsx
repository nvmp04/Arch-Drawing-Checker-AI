"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import {
  AlertTriangleIcon,
  CheckIcon,
  PageIcon,
  UploadIcon,
  XIcon,
} from "@/shared/components/icons";
import { TipTitle, Tooltip } from "@/shared/components/Tooltip";
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  HOUSE_TYPE_CONFIG,
  HOUSE_TYPE_ORDER,
} from "@/shared/constants/domain";
import type { ChtkCategory, HouseType } from "@/shared/constants/enums";
import {
  CATEGORY_CHECK_DESCRIPTIONS,
  MAX_FILE_SIZE_MB,
  UPLOAD_ACCEPT,
} from "../constants/review.constants";
import { reviewsService } from "../services/reviews.service";
import type { ChtkStandardSet, ZoneOption } from "../types/review.types";

const CONTROL_CLASS =
  "h-9 w-full rounded-md border border-border-default bg-surface-sunken px-3 text-sm text-text-primary " +
  "transition-colors duration-150 placeholder:text-text-muted hover:border-border-strong " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FormField({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium uppercase tracking-wide text-text-muted"
      >
        {label}
        {required && <span className="text-fail-text"> *</span>}
      </label>
      {children}
    </div>
  );
}

function PdfDropzone({
  file,
  onFileChange,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleFiles = (files: FileList | null) => {
    const next = files?.[0];
    if (next && next.type === "application/pdf") onFileChange(next);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-sunken px-4 py-3">
        <PageIcon className="size-8 shrink-0 text-accent-text" />
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
          onClick={() => {
            onFileChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-fail-text
                     transition-colors duration-150 hover:bg-surface-hover
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
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
        Kéo thả file PDF vào đây, hoặc{" "}
        <span className="text-accent-text underline-offset-2 hover:underline">
          chọn file
        </span>
      </p>
      <p className="text-xs text-text-muted">
        Chỉ nhận file .pdf, tối đa {MAX_FILE_SIZE_MB}MB
      </p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={UPLOAD_ACCEPT}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
}

function HouseTypeOption({
  houseType,
  isSelected,
  onSelect,
}: {
  houseType: HouseType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const config = HOUSE_TYPE_CONFIG[houseType];
  return (
    <Tooltip content={<TipTitle>{config.label}</TipTitle>}>
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        aria-label={config.label}
        onClick={onSelect}
        data-selected={isSelected}
        className="rounded-md px-3 py-1.5 text-sm text-text-secondary shadow-ds-border
                   transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                   data-[selected=true]:bg-accent data-[selected=true]:text-text-on-accent
                   data-[selected=true]:shadow-none"
      >
        {config.short}
      </button>
    </Tooltip>
  );
}

function CategoryOption({
  category,
  checked,
  onToggle,
}: {
  category: ChtkCategory;
  checked: boolean;
  onToggle: () => void;
}) {
  const config = CATEGORY_CONFIG[category];
  return (
    <label
      data-checked={checked}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3
                 transition-colors duration-150 hover:bg-surface-hover
                 data-[checked=true]:border-accent data-[checked=true]:bg-accent-subtle"
    >
      <span
        data-checked={checked}
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-strong
                   data-[checked=true]:border-accent data-[checked=true]:bg-accent data-[checked=true]:text-text-on-accent"
      >
        {checked && <CheckIcon className="size-3" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`size-1.5 shrink-0 rounded-full ${config.dot}`}
            aria-hidden
          />
          <span className="text-sm font-medium text-text-primary">
            {config.section}. {config.label}
          </span>
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-text-muted">
          {CATEGORY_CHECK_DESCRIPTIONS[category]}
        </span>
      </span>
    </label>
  );
}

export function ReviewUploadForm({
  workspaceSlug,
  zoneOptions,
  standardSets,
}: {
  workspaceSlug: string;
  zoneOptions: readonly ZoneOption[];
  standardSets: readonly ChtkStandardSet[];
}) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [standardSetId, setStandardSetId] = useState("");
  const [houseType, setHouseType] = useState<HouseType | null>(null);
  const [categories, setCategories] = useState<ReadonlySet<ChtkCategory>>(
    new Set(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (category: ChtkCategory) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const isValid =
    file !== null &&
    name.trim().length > 0 &&
    zoneId !== "" &&
    standardSetId !== "" &&
    houseType !== null &&
    categories.size > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || !file || !houseType) {
      setError(
        "Điền đủ thông tin, chọn file PDF và ít nhất một nhóm tiêu chí trước khi tải lên.",
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const review = await reviewsService.createReview({
        name: name.trim(),
        zoneId,
        standardSetId,
        houseType,
        categories: Array.from(categories),
        file: { name: file.name, sizeBytes: file.size },
      });
      router.push(`/${workspaceSlug}/reviews/${review.id}/processing`);
    } catch {
      setError("Không tạo được hồ sơ. Thử lại sau.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-lg bg-surface-raised p-4 shadow-ds-small">
        <h2 className="text-sm font-medium text-text-primary">Bản vẽ PDF</h2>
        <p className="mt-1 text-xs text-text-muted">
          Tải lên toàn bộ hồ sơ bản vẽ cần soát dưới dạng một file PDF.
        </p>
        <div className="mt-3">
          <PdfDropzone file={file} onFileChange={setFile} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-lg bg-surface-raised p-4 shadow-ds-small sm:grid-cols-2">
        <FormField label="Tên hồ sơ" htmlFor="review-name" required>
          <input
            id="review-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ví dụ: PN2 Đà Nẵng — Shophouse lô B12"
            className={CONTROL_CLASS}
          />
        </FormField>

        <FormField label="Phân khu" htmlFor="review-zone" required>
          <select
            id="review-zone"
            value={zoneId}
            onChange={(event) => setZoneId(event.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="">Chọn phân khu</option>
            {zoneOptions.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Tiêu chuẩn CHTK" htmlFor="review-standard" required>
          <select
            id="review-standard"
            value={standardSetId}
            onChange={(event) => setStandardSetId(event.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="">Chọn bộ tiêu chuẩn đã tải lên</option>
            {standardSets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name} · {set.ruleCount} tiêu chí
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Loại sản phẩm nhà" required>
          <div
            role="radiogroup"
            aria-label="Loại sản phẩm nhà"
            className="flex flex-wrap gap-2 pt-0.5"
          >
            {HOUSE_TYPE_ORDER.map((type) => (
              <HouseTypeOption
                key={type}
                houseType={type}
                isSelected={houseType === type}
                onSelect={() => setHouseType(type)}
              />
            ))}
          </div>
        </FormField>
      </section>

      <section className="rounded-lg bg-surface-raised p-4 shadow-ds-small">
        <h2 className="text-sm font-medium text-text-primary">
          Nhóm tiêu chí cần kiểm tra
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Chọn một hoặc nhiều nhóm CHTK sẽ đối chiếu cho hồ sơ này.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
          {CATEGORY_ORDER.map((category) => (
            <CategoryOption
              key={category}
              category={category}
              checked={categories.has(category)}
              onToggle={() => toggleCategory(category)}
            />
          ))}
        </div>
      </section>

      {error && (
        <p className="flex items-center gap-2 text-sm text-fail-text">
          <AlertTriangleIcon className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-text-on-accent
                     transition-colors duration-150 hover:bg-accent-hover
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Đang tải lên..." : "Tải lên và bắt đầu phân tích"}
        </button>
      </div>
    </form>
  );
}
