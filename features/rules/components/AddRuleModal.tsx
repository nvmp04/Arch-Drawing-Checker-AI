"use client";

import { useState } from "react";

import { Modal } from "@/shared/components/Modal";
import { Switch } from "@/shared/components/Switch";
import { AlertTriangleIcon, CheckIcon } from "@/shared/components/icons";
import {
  CATEGORY_CONFIG,
  categoryFromRuleIndex,
  CHECK_TYPE_CONFIG,
  CHECK_TYPE_ORDER,
  HOUSE_TYPE_CONFIG,
  HOUSE_TYPE_ORDER,
  OPERATOR_CONFIG,
  OPERATOR_ORDER,
} from "@/shared/constants/domain";
import type {
  CheckType,
  ChtkCategory,
  ComparisonOperator,
  HouseType,
} from "@/shared/constants/enums";
import { rulesService } from "../services/rules.service";
import type { Rule } from "../types/rule.types";

const CONTROL_CLASS =
  "h-9 w-full rounded-md border border-border-default bg-surface-sunken px-3 text-sm text-text-primary " +
  "transition-colors duration-150 placeholder:text-text-muted hover:border-border-strong " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus";

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

function HouseTypeCheckbox({
  houseType,
  checked,
  onToggle,
}: {
  houseType: HouseType;
  checked: boolean;
  onToggle: () => void;
}) {
  const config = HOUSE_TYPE_CONFIG[houseType];
  return (
    <label
      data-checked={checked}
      title={config.label}
      className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-sm
                 text-text-secondary transition-colors duration-150 hover:bg-surface-hover
                 data-[checked=true]:border-accent data-[checked=true]:bg-accent-subtle data-[checked=true]:text-accent-text"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      {checked && <CheckIcon className="size-3.5 shrink-0" />}
      {config.short}
    </label>
  );
}

export function AddRuleModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (rule: Rule) => void;
}) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [checkType, setCheckType] = useState<CheckType | "">("");
  const [operator, setOperator] = useState<ComparisonOperator | "">("");
  const [value, setValue] = useState("");
  const [houseTypes, setHouseTypes] = useState<ReadonlySet<HouseType>>(
    new Set(),
  );
  const [note, setNote] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewCategory: ChtkCategory | null =
    code.trim().length > 0 ? categoryFromRuleIndex(code.trim()) : null;

  const toggleHouseType = (type: HouseType) => {
    setHouseTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const isValid =
    code.trim().length > 0 &&
    title.trim().length > 0 &&
    checkType !== "" &&
    operator !== "" &&
    value.trim().length > 0 &&
    houseTypes.size > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) {
      setError("Điền đủ các trường bắt buộc trước khi thêm tiêu chí.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const rule = await rulesService.createRule({
        code: code.trim(),
        title: title.trim(),
        checkType,
        operator,
        value: value.trim(),
        houseTypes: Array.from(houseTypes),
        note: note.trim() || undefined,
        isActive,
      });
      onCreate(rule);
    } catch {
      setError("Không tạo được tiêu chí. Thử lại sau.");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Thêm tiêu chí mới" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Mã tiêu chí" htmlFor="rule-code" required>
            <input
              id="rule-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Ví dụ: 1.3.1"
              className={`numeric ${CONTROL_CLASS}`}
            />
          </FormField>

          <FormField label="Nhóm CHTK">
            <div className="flex h-9 items-center gap-2 rounded-md bg-surface-sunken px-3 text-sm text-text-muted">
              {previewCategory ? (
                <>
                  <span
                    className={`size-2 shrink-0 rounded-full ${CATEGORY_CONFIG[previewCategory].dot}`}
                    aria-hidden
                  />
                  {CATEGORY_CONFIG[previewCategory].label}
                </>
              ) : (
                "Suy ra từ mã tiêu chí"
              )}
            </div>
          </FormField>
        </div>

        <FormField label="Tên tiêu chí" htmlFor="rule-title" required>
          <input
            id="rule-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ví dụ: Chiều cao lan can"
            className={CONTROL_CLASS}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Loại kiểm tra" htmlFor="rule-check-type" required>
            <select
              id="rule-check-type"
              value={checkType}
              onChange={(event) =>
                setCheckType(event.target.value as CheckType | "")
              }
              className={CONTROL_CLASS}
            >
              <option value="">Chọn loại kiểm tra</option>
              {CHECK_TYPE_ORDER.map((type) => (
                <option key={type} value={type}>
                  {type}. {CHECK_TYPE_CONFIG[type].label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Phép so sánh" htmlFor="rule-operator" required>
            <select
              id="rule-operator"
              value={operator}
              onChange={(event) =>
                setOperator(event.target.value as ComparisonOperator | "")
              }
              className={CONTROL_CLASS}
            >
              <option value="">Chọn phép so sánh</option>
              {OPERATOR_ORDER.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_CONFIG[op].label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Giá trị / yêu cầu" htmlFor="rule-value" required>
          <input
            id="rule-value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ví dụ: ≥ 1.1 m"
            className={CONTROL_CLASS}
          />
        </FormField>

        <FormField label="Loại nhà áp dụng" required>
          <div className="flex flex-wrap gap-2">
            {HOUSE_TYPE_ORDER.map((type) => (
              <HouseTypeCheckbox
                key={type}
                houseType={type}
                checked={houseTypes.has(type)}
                onToggle={() => toggleHouseType(type)}
              />
            ))}
          </div>
        </FormField>

        <FormField label="Ghi chú" htmlFor="rule-note">
          <textarea
            id="rule-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder="Diễn giải thêm nếu cần người thẩm định lưu ý"
            className={`resize-none py-2 ${CONTROL_CLASS} h-auto`}
          />
        </FormField>

        {error && (
          <p className="flex items-center gap-2 text-sm text-fail-text">
            <AlertTriangleIcon className="size-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
          <Switch
            checked={isActive}
            onChange={setIsActive}
            label="Áp dụng tiêu chí ngay khi tạo"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-md px-3 text-sm text-text-secondary
                         transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-text-on-accent
                         transition-colors duration-150 hover:bg-accent-hover
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Đang thêm..." : "Thêm tiêu chí"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
