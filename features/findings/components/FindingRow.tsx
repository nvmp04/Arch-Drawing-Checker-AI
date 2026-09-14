import Link from "next/link";

import { ChevronRightIcon } from "@/shared/components/icons";
import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import { STATUS_CONFIG } from "../constants/finding.constants";
import type { Finding } from "../types/finding.types";
import { ChtkCategoryTag } from "./ChtkCategoryTag";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ExtractedVsExpectedValue } from "./ExtractedVsExpectedValue";
import { FindingSeverityBadge } from "./FindingSeverityBadge";
import { FindingStatusBadge } from "./FindingStatusBadge";
import { PageReferenceLink } from "./PageReferenceLink";
import { ReasoningGroupTag } from "./ReasoningGroupTag";

/**
 * Cấp 3 của cây — một tiêu chí. Thứ tự trái sang phải:
 * mức độ · chỉ mục · loại chi tiết · vi phạm/tiêu chuẩn · độ tin cậy ·
 * nhóm trích xuất · nhóm CHTK · trang PDF · trạng thái.
 *
 * Không dùng bố cục bảng — mỗi phần tử tự giải thích bằng khung chú thích
 * khi hover, nên không cần hàng nhãn cột. Đường dẫn dọc mang màu trạng thái
 * do nhóm cha vẽ, dòng không tự vẽ viền trái nữa.
 */
export function FindingRow({
  finding,
  workspaceSlug,
}: {
  finding: Finding;
  workspaceSlug: string;
}) {
  const { label: statusLabel } = STATUS_CONFIG[finding.status];

  return (
    <Link
      href={`/${workspaceSlug}/reviews/${finding.reviewId}`}
      aria-label={`${finding.ruleIndex} ${finding.detailLabel} — ${statusLabel}, mức độ ${finding.severity}, trang ${finding.pageNumber}`}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 pl-4 pr-3
                 transition-colors duration-150 hover:bg-surface-hover
                 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus"
    >
      <FindingSeverityBadge severity={finding.severity} />

      <Tooltip
        content={
          <>
            <TipTitle>Chỉ mục {finding.ruleIndex}</TipTitle>
            <TipText>
              Vị trí của tiêu chí trong bộ tiêu chuẩn CHTK. Mở tab Tiêu chuẩn
              CHTK để xem toàn văn mục này.
            </TipText>
          </>
        }
      >
        <span className="numeric text-sm text-text-secondary">{finding.ruleIndex}</span>
      </Tooltip>

      <Tooltip
        className="min-w-0 flex-1 basis-40"
        content={
          <>
            <TipTitle>{finding.detailLabel}</TipTitle>
            <TipText>Hạng mục chi tiết được đối chiếu trên bản vẽ.</TipText>
          </>
        }
      >
        <span className="block min-w-0 truncate text-sm text-text-primary">
          {finding.detailLabel}
        </span>
      </Tooltip>

      <ExtractedVsExpectedValue
        extractedValue={finding.extractedValue}
        standardValue={finding.standardValue}
        status={finding.status}
      />

      <span className="ml-auto flex items-center gap-3">
        <ConfidenceBadge value={finding.confidence} group={finding.group} />
        <ReasoningGroupTag group={finding.group} />
        <ChtkCategoryTag category={finding.category} />
        <PageReferenceLink pageNumber={finding.pageNumber} />
        <FindingStatusBadge status={finding.status} />
        <ChevronRightIcon className="size-4 shrink-0 text-text-muted" />
      </span>
    </Link>
  );
}
