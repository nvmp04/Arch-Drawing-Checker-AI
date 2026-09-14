"use client";

import { Switch } from "@/shared/components/Switch";
import { TipMeta, TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import {
  CHECK_TYPE_CONFIG,
  houseTypeFullLabel,
  houseTypeScopeLabel,
  OPERATOR_CONFIG,
} from "@/shared/constants/domain";
import type { Rule } from "../types/rule.types";
import { RuleActionMenu, type RuleAction } from "./RuleActionMenu";

/**
 * Một quy tắc kiểm tra hiển thị theo dòng. Trái sang phải:
 * mã · tên · phép so sánh + giá trị · loại nhà áp dụng ·
 * badge loại kiểm tra · công tắc áp dụng · menu thao tác.
 */
export function RuleRow({
  rule,
  onToggleActive,
  onAction,
}: {
  rule: Rule;
  onToggleActive: (next: boolean) => void;
  onAction: (action: RuleAction) => void;
}) {
  const checkType = CHECK_TYPE_CONFIG[rule.checkType];
  const operator = OPERATOR_CONFIG[rule.operator];
  const scope = houseTypeScopeLabel(rule.houseTypes);
  const isAllHouseTypes = scope === "Mọi loại nhà";

  return (
    <div
      data-inactive={!rule.isActive}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 pl-4 pr-3
                 transition-colors duration-150 hover:bg-surface-hover
                 data-[inactive=true]:opacity-55"
    >
      {/* Mã tiêu chí */}
      <Tooltip
        content={
          <>
            <TipTitle>Mã tiêu chí {rule.code}</TipTitle>
            <TipText>
              Vị trí trong bộ tiêu chuẩn CHTK. Chữ số đầu quyết định nhóm: 1.x
              Mặt ngoài · 2.x Kích thước · 3.x Thang – Ramp · 4.x Cấu tạo · 5.x
              Hoàn thiện.
            </TipText>
          </>
        }
      >
        <span className="numeric w-14 shrink-0 text-sm text-text-secondary">
          {rule.code}
        </span>
      </Tooltip>

      {/* Tên quy tắc */}
      <Tooltip
        className="min-w-0 flex-1 basis-48"
        content={
          <>
            <TipTitle>{rule.title}</TipTitle>
            {rule.note && <TipText>{rule.note}</TipText>}
            <TipMeta>
              {rule.isActive ? "Đang áp dụng" : "Đang tạm ngưng"}
            </TipMeta>
          </>
        }
      >
        <span className="block min-w-0 truncate text-sm text-text-primary">
          {rule.title}
        </span>
      </Tooltip>

      {/* Phép so sánh + giá trị */}
      <Tooltip
        className="min-w-0 basis-72"
        content={
          <>
            <TipTitle>{operator.label}</TipTitle>
            <TipText>{rule.value}</TipText>
          </>
        }
      >
        <span className="flex min-w-0 items-baseline gap-1.5 text-sm">
          <span className="shrink-0 rounded-sm bg-surface-sunken px-1.5 py-0.5 text-xs text-text-secondary">
            {operator.label}
          </span>
          <span className="min-w-0 truncate text-text-secondary">{rule.value}</span>
        </span>
      </Tooltip>

      <span className="ml-auto flex items-center gap-3">
        {/* Loại nhà áp dụng */}
        <Tooltip
          align="right"
          content={
            <>
              <TipTitle>Loại nhà áp dụng</TipTitle>
              <TipText>
                {isAllHouseTypes
                  ? "Quy tắc áp dụng cho cả năm loại nhà."
                  : houseTypeFullLabel(rule.houseTypes)}
              </TipText>
              <TipText>
                SH Shophouse · TH Townhouse / Nhà phố liên kế · SV Semi Villa ·
                SGV Single Villa · SHV Shop Villa
              </TipText>
            </>
          }
        >
          {/* Viết tắt + bề rộng cố định để cột thẳng hàng qua các dòng */}
          <span className="hidden w-32 justify-center truncate whitespace-nowrap rounded-sm border border-border-default px-1.5 py-0.5 text-center text-xs text-text-muted lg:inline-flex">
            {scope}
          </span>
        </Tooltip>

        {/* Badge loại kiểm tra */}
        <Tooltip
          align="right"
          content={
            <>
              <TipTitle>{checkType.title}</TipTitle>
              <TipText>{checkType.method}</TipText>
              <TipMeta>
                Độ tin cậy kỳ vọng:{" "}
                <span className="numeric text-text-secondary">
                  {checkType.expectedConfidence}
                </span>
              </TipMeta>
            </>
          }
        >
          <span
            className={`inline-flex size-6 items-center justify-center rounded-sm text-xs font-medium ${checkType.badge}`}
          >
            {rule.checkType}
          </span>
        </Tooltip>

        <Switch
          checked={rule.isActive}
          onChange={onToggleActive}
          label={`Áp dụng tiêu chí ${rule.code}`}
        />

        <RuleActionMenu ruleCode={rule.code} onAction={onAction} />
      </span>
    </div>
  );
}
