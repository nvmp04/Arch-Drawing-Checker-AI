import { PageIcon } from "@/shared/components/icons";
import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";

/** Số thứ tự trang trong file PDF bản vẽ nơi phát hiện tiêu chí. */
export function PageReferenceLink({ pageNumber }: { pageNumber: number }) {
  return (
    <Tooltip
      align="right"
      content={
        <>
          <TipTitle>Trang {pageNumber} trong file PDF</TipTitle>
          <TipText>
            Vị trí máy phát hiện tiêu chí. Mở hồ sơ thẩm định để xem vùng khoanh
            trên đúng trang này.
          </TipText>
        </>
      }
    >
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-text-muted">
        <PageIcon className="size-3.5 shrink-0" />
        <span className="numeric">tr. {pageNumber}</span>
      </span>
    </Tooltip>
  );
}
