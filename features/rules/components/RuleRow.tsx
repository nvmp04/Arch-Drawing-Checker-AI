"use client";

import { Switch } from "@/shared/components/Switch";
import { TipMeta, TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import {
  CHECK_TYPE_CONFIG,
  houseTypeFullLabel,
  houseTypeScopeLabel,
  OPERATOR_CONFIG,
} from "@/shared/constants/domain";
import { headingTrail, ruleDisplayCode } from "../constants/rule.constants";
import type { Rule } from "../types/rule.types";
import { RuleActionMenu, type RuleAction } from "./RuleActionMenu";

/**
 * Một quy tắc kiểm tra hiển thị theo dòng. Trái sang phải:
 * mã · tên · yêu cầu · loại nhà áp dụng · loại kiểm tra · công tắc · menu.
 *
 * Ba cột phải chịu được giá trị rỗng, vì dữ liệu thật đọc từ Excel thường
 * thiếu (file CHTK mẫu: `code` null 41/92, `checkType` null 92/92,
 * `operator`/`value` null 62/92). Thứ **luôn có** là `title` và `requirement`.
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
  const checkType = rule.checkType ? CHECK_TYPE_CONFIG[rule.checkType] : null;
  const operator = rule.operator ? OPERATOR_CONFIG[rule.operator] : null;
  const scope = houseTypeScopeLabel(rule.houseTypes);
  const isAllHouseTypes = scope === "Mọi loại nhà";
  const displayCode = ruleDisplayCode(rule);
  const trail = headingTrail(rule.headings);

  /** Có đủ phép so sánh + giá trị thì hiện dạng đối chiếu được; không thì hiện nguyên văn yêu cầu. */
  const hasComparison = operator !== null && rule.value !== null;

  return (
    <div
      data-inactive={!rule.isActive}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 pl-4 pr-3
                 transition-colors duration-150 hover:bg-surface-hover
                 data-[inactive=true]:opacity-55"
    >
      {/* Mã tiêu chí — dòng biến thể không có mã riêng, hiện mã cha kèm dấu ↳ */}
      <Tooltip
        content={
          rule.code ? (
            <>
              <TipTitle>Mã tiêu chí {rule.code}</TipTitle>
              <TipText>
                Vị trí trong bộ tiêu chuẩn CHTK. Chữ số đầu quyết định nhóm: 1.x
                Mặt ngoài · 2.x Kích thước · 3.x Thang – Ramp · 4.x Cấu tạo · 5.x
                Hoàn thiện.
              </TipText>
              <TipMeta>
                Dòng <span className="numeric">{rule.sourceRow}</span> trong file Excel
              </TipMeta>
            </>
          ) : (
            <>
              <TipTitle>Dòng biến thể của {rule.parentCode ?? "mục cha"}</TipTitle>
              <TipText>
                Trong file Excel, dòng này nằm dưới một mã cha và không có mã
                riêng — thường là một biến thể theo loại nhà.
              </TipText>
              {trail && <TipText>{trail}</TipText>}
              <TipMeta>
                Dòng <span className="numeric">{rule.sourceRow}</span> trong file Excel
              </TipMeta>
            </>
          )
        }
      >
        <span className="numeric w-14 shrink-0 truncate text-sm text-text-secondary">
          {rule.code ?? (
            <span className="text-text-muted">↳ {rule.parentCode ?? "—"}</span>
          )}
        </span>
      </Tooltip>

      {/* Tên quy tắc */}
      <Tooltip
        className="min-w-0 flex-1 basis-48"
        content={
          <>
            <TipTitle>{rule.title}</TipTitle>
            {trail && <TipText>{trail}</TipText>}
            <TipMeta>{rule.isActive ? "Đang áp dụng" : "Đang tạm ngưng"}</TipMeta>
          </>
        }
      >
        <span className="block min-w-0 truncate text-sm text-text-primary">
          {rule.title}
        </span>
      </Tooltip>

      {/* Yêu cầu — phép so sánh + giá trị khi đọc được, nếu không thì nguyên văn */}
      <Tooltip
        className="min-w-0 basis-72"
        content={
          hasComparison ? (
            <>
              <TipTitle>{operator.label}</TipTitle>
              <TipText>{rule.value}</TipText>
              {rule.requirement && <TipMeta>{rule.requirement}</TipMeta>}
            </>
          ) : (
            <>
              <TipTitle>Tiêu chuẩn áp dụng</TipTitle>
              {rule.requirementLines.length > 0 ? (
                rule.requirementLines.map((line, index) => (
                  <TipText key={index}>• {line}</TipText>
                ))
              ) : (
                <TipText>Chưa có nội dung tiêu chuẩn cho dòng này.</TipText>
              )}
              <TipMeta>
                Chưa quy được về phép so sánh máy đối chiếu tự động được.
              </TipMeta>
            </>
          )
        }
      >
        <span className="flex min-w-0 items-baseline gap-1.5 text-sm">
          {hasComparison ? (
            <>
              <span className="shrink-0 rounded-sm bg-surface-sunken px-1.5 py-0.5 text-xs text-text-secondary">
                {operator.label}
              </span>
              <span className="min-w-0 truncate text-text-secondary">
                {rule.value}
              </span>
            </>
          ) : (
            <span className="min-w-0 truncate text-text-muted">
              {rule.requirementLines[0] || rule.requirement || "—"}
            </span>
          )}
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

        {/* Loại kiểm tra — Excel không có cột này nên thường chưa phân loại */}
        <Tooltip
          align="right"
          content={
            checkType ? (
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
            ) : (
              <>
                <TipTitle>Chưa phân loại kiểm tra</TipTitle>
                <TipText>
                  File Excel không có cột loại kiểm tra. Tiêu chí sẽ được gán
                  nhóm A–D ở bước phân loại sau, bằng máy hoặc bằng người.
                </TipText>
              </>
            )
          }
        >
          <span
            className={`inline-flex size-6 items-center justify-center rounded-sm text-xs font-medium ${
              checkType ? checkType.badge : "bg-surface-sunken text-text-muted"
            }`}
          >
            {rule.checkType ?? "–"}
          </span>
        </Tooltip>

        <Switch
          checked={rule.isActive}
          onChange={onToggleActive}
          label={`Áp dụng tiêu chí ${displayCode}`}
        />

        <RuleActionMenu ruleCode={displayCode} onAction={onAction} />
      </span>
    </div>
  );
}
