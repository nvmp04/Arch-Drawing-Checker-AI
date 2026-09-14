"use client";

import { CascadingFilterMenu } from "@/shared/components/CascadingFilterMenu";
import { XIcon } from "@/shared/components/icons";
import {
  FILTER_GROUP_KEYS,
  FILTER_GROUP_LABEL,
  filterValueLabel,
  RULE_FILTER_GROUPS,
  type RuleFilterGroupKey,
} from "../constants/rule.constants";
import { EMPTY_RULE_FILTER, type RuleFilterState } from "../types/rule.types";

/** Menu lọc đa cấp + dãy chip hiển thị điều kiện đang bật. */
export function RuleFilterBar({
  filters,
  onChange,
  resultCount,
  totalCount,
}: {
  filters: RuleFilterState;
  onChange: (next: RuleFilterState) => void;
  resultCount: number;
  totalCount: number;
}) {
  const selected: Record<string, readonly string[]> = {
    category: filters.category,
    checkType: filters.checkType,
    houseType: filters.houseType,
    operator: filters.operator,
  };

  const handleMenuChange = (next: Record<string, readonly string[]>) => {
    onChange({
      category: next.category as RuleFilterState["category"],
      checkType: next.checkType as RuleFilterState["checkType"],
      houseType: next.houseType as RuleFilterState["houseType"],
      operator: next.operator as RuleFilterState["operator"],
    });
  };

  const removeValue = (groupKey: RuleFilterGroupKey, value: string) => {
    handleMenuChange({
      ...selected,
      [groupKey]: (selected[groupKey] ?? []).filter((v) => v !== value),
    });
  };

  const activeChips = FILTER_GROUP_KEYS.flatMap((groupKey) =>
    (selected[groupKey] ?? []).map((value) => ({ groupKey, value })),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <CascadingFilterMenu
          groups={RULE_FILTER_GROUPS}
          selected={selected}
          onChange={handleMenuChange}
          onClear={() => onChange(EMPTY_RULE_FILTER)}
        />

        <span className="text-sm text-text-muted">
          <span className="numeric">{resultCount}</span>
          {resultCount !== totalCount && (
            <>
              {" / "}
              <span className="numeric">{totalCount}</span>
            </>
          )}{" "}
          tiêu chí
        </span>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeChips.map(({ groupKey, value }) => (
            <span
              key={`${groupKey}:${value}`}
              className="inline-flex items-center gap-1 rounded-sm bg-surface-sunken py-0.5 pl-2 pr-1 text-xs text-text-secondary"
            >
              <span className="text-text-muted">{FILTER_GROUP_LABEL[groupKey]}:</span>
              {filterValueLabel(groupKey, value)}
              <button
                type="button"
                onClick={() => removeValue(groupKey, value)}
                aria-label={`Bỏ lọc ${FILTER_GROUP_LABEL[groupKey]}: ${filterValueLabel(groupKey, value)}`}
                className="inline-flex size-4 items-center justify-center rounded-sm
                           text-text-muted transition-colors duration-150
                           hover:bg-surface-active hover:text-text-primary
                           focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={() => onChange(EMPTY_RULE_FILTER)}
            className="rounded-md px-2 py-0.5 text-xs text-text-muted transition-colors duration-150
                       hover:bg-surface-hover hover:text-text-primary
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            Xóa lọc
          </button>
        </div>
      )}
    </div>
  );
}
