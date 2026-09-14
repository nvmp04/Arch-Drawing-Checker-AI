import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import type { FindingStatus } from "@/shared/constants/enums";

/** Giá trị máy trích xuất được đặt cạnh giá trị tiêu chuẩn áp dụng. */
export function ExtractedVsExpectedValue({
  extractedValue,
  standardValue,
  status,
}: {
  extractedValue: string;
  standardValue: string;
  status: FindingStatus;
}) {
  const extractedTone =
    status === "fail"
      ? "text-fail-text font-medium"
      : status === "warning"
        ? "text-warning-text"
        : status === "unknown"
          ? "text-text-muted italic"
          : "text-text-primary";

  return (
    <Tooltip
      className="min-w-0 max-w-full"
      content={
        <>
          <TipTitle>Vi phạm — Tiêu chuẩn</TipTitle>
          <TipText>
            Trước dấu gạch chéo là giá trị máy trích xuất từ bản vẽ; sau dấu gạch
            chéo là tiêu chuẩn CHTK áp dụng cho tiêu chí này.
          </TipText>
          <TipText>
            <span className={extractedTone}>{extractedValue}</span>
            <span className="text-text-muted"> / {standardValue}</span>
          </TipText>
        </>
      }
    >
      <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-sm">
        <span className={`min-w-0 break-words ${extractedTone}`}>{extractedValue}</span>
        <span className="text-text-muted" aria-hidden>
          /
        </span>
        <span className="min-w-0 break-words text-text-muted">{standardValue}</span>
      </span>
    </Tooltip>
  );
}
