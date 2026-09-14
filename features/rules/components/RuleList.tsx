"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/shared/constants/domain";
import type { Rule, RuleFilterState } from "../types/rule.types";
import { EMPTY_RULE_FILTER } from "../types/rule.types";
import { RuleFilterBar } from "./RuleFilterBar";
import { RuleRow } from "./RuleRow";
import type { RuleAction } from "./RuleActionMenu";

/**
 * Lọc theo phép giao giữa các nhóm thuộc tính (AND) và phép hợp giữa các giá
 * trị trong cùng một nhóm (OR). Nhóm không chọn gì thì không ràng buộc.
 */
function matches(rule: Rule, filters: RuleFilterState): boolean {
  if (filters.category.length > 0 && !filters.category.includes(rule.category)) {
    return false;
  }
  if (filters.checkType.length > 0 && !filters.checkType.includes(rule.checkType)) {
    return false;
  }
  if (filters.operator.length > 0 && !filters.operator.includes(rule.operator)) {
    return false;
  }
  if (
    filters.houseType.length > 0 &&
    !filters.houseType.some((h) => rule.houseTypes.includes(h))
  ) {
    return false;
  }
  return true;
}

export function RuleList({ rules }: { rules: readonly Rule[] }) {
  const [filters, setFilters] = useState<RuleFilterState>(EMPTY_RULE_FILTER);
  /** Bật/tắt quy tắc — state cục bộ, chưa nối API. */
  const [overrides, setOverrides] = useState<Readonly<Record<string, boolean>>>({});

  const visible = useMemo(
    () => rules.filter((rule) => matches(rule, filters)),
    [rules, filters],
  );

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        items: visible.filter((rule) => rule.category === category),
      })).filter((group) => group.items.length > 0),
    [visible],
  );

  const handleAction = (rule: Rule, action: RuleAction) => {
    // Chưa nối API — mới dựng khung giao diện.
    console.log(`[rules] ${action}`, rule.code);
  };

  return (
    <div className="space-y-4">
      <RuleFilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={visible.length}
        totalCount={rules.length}
      />

      {grouped.length === 0 ? (
        <div className="rounded-lg bg-surface-raised px-4 py-10 text-center shadow-ds-small">
          <EmptyState message="Không có tiêu chí nào khớp bộ lọc." />
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ category, items }) => (
            <section
              key={category}
              className="rounded-lg bg-surface-raised shadow-ds-small"
            >
              <h2 className="flex items-center gap-2 border-b border-border-subtle px-4 py-2.5">
                <span
                  className={`size-2 shrink-0 rounded-full ${CATEGORY_CONFIG[category].dot}`}
                  aria-hidden
                />
                <span className="numeric text-sm font-medium text-text-primary">
                  {CATEGORY_CONFIG[category].section}.
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {CATEGORY_CONFIG[category].label}
                </span>
                <span className="numeric text-xs text-text-muted">
                  {items.length}
                </span>
              </h2>

              <ul className="divide-y divide-border-subtle">
                {items.map((rule) => {
                  const isActive = overrides[rule.id] ?? rule.isActive;
                  return (
                    <li key={rule.id}>
                      <RuleRow
                        rule={{ ...rule, isActive }}
                        onToggleActive={(next) =>
                          setOverrides((prev) => ({ ...prev, [rule.id]: next }))
                        }
                        onAction={(action) => handleAction(rule, action)}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
