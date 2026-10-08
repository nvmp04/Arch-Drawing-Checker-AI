"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { PlusIcon } from "@/shared/components/icons";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/shared/constants/domain";
import type { Rule, RuleFilterState } from "../types/rule.types";
import { EMPTY_RULE_FILTER } from "../types/rule.types";
import { AddRuleModal } from "./AddRuleModal";
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
  // `checkType` và `operator` có thể rỗng trong dữ liệu thật. Tiêu chí chưa có
  // giá trị thì **không khớp** khi người dùng lọc theo trường đó — lọc là để
  // thu hẹp về những dòng chắc chắn thuộc nhóm đã chọn.
  if (
    filters.checkType.length > 0 &&
    (rule.checkType === null || !filters.checkType.includes(rule.checkType))
  ) {
    return false;
  }
  if (
    filters.operator.length > 0 &&
    (rule.operator === null || !filters.operator.includes(rule.operator))
  ) {
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

export function RuleList({
  rules: initialRules,
  ruleSetId,
}: {
  rules: readonly Rule[];
  /** Bộ chứa các tiêu chí này — tiêu chí thêm bằng tay phải thuộc về một bộ. */
  ruleSetId: string;
}) {
  /** Danh sách tiêu chí — cục bộ để tiêu chí thêm mới xuất hiện ngay, chưa nối API. */
  const [rules, setRules] = useState<readonly Rule[]>(initialRules);
  const [filters, setFilters] = useState<RuleFilterState>(EMPTY_RULE_FILTER);
  /** Bật/tắt quy tắc — state cục bộ, chưa nối API. */
  const [overrides, setOverrides] = useState<Readonly<Record<string, boolean>>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
      {/*
        Thanh lọc và nút thêm tiêu chí nằm cùng hàng vì cùng thao tác ở cấp
        "một tiêu chí bên trong bộ đang xem". Việc ở cấp cả bộ (chọn bộ, nạp
        Excel) nằm ở `StandardSetBar` phía trên.
      */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <RuleFilterBar
            filters={filters}
            onChange={setFilters}
            resultCount={visible.length}
            totalCount={rules.length}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-text-on-accent
                     transition-colors duration-150 hover:bg-accent-hover
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <PlusIcon className="size-4" />
          Thêm tiêu chí mới
        </button>
      </div>

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

      {isAddModalOpen && (
        <AddRuleModal
          ruleSetId={ruleSetId}
          onClose={() => setIsAddModalOpen(false)}
          onCreate={(rule) => {
            setRules((prev) => [rule, ...prev]);
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
