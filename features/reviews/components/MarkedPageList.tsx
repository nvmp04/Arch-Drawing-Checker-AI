import { TipText, TipTitle, Tooltip } from "@/shared/components/Tooltip";
import { STATUS_CONFIG, STATUS_ORDER } from "@/shared/constants/domain";
import type { FindingStatus } from "@/shared/constants/enums";

export type MarkedPage = {
  pageNumber: number;
  /** Các trạng thái khác nhau xuất hiện trên trang, đã khử trùng, đúng STATUS_ORDER. */
  statuses: readonly FindingStatus[];
  /** Số tiêu chí trên trang, dùng cho khung chú thích. */
  count: number;
};

/**
 * Danh sách trang có đánh dấu (có ít nhất một finding). Mỗi trang hiện một
 * chấm màu cho từng trạng thái khác nhau xuất hiện trên trang đó — màu không
 * bao giờ đứng một mình, tên trạng thái nằm trong khung chú thích khi hover.
 */
export function MarkedPageList({
  pages,
  activePage,
  onSelectPage,
}: {
  pages: readonly MarkedPage[];
  activePage: number;
  onSelectPage: (pageNumber: number) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-surface-raised shadow-ds-small">
      <div className="shrink-0 border-b border-border-subtle px-3 py-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Trang đánh dấu
        </h2>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {pages.map((page) => {
          const isActive = page.pageNumber === activePage;
          return (
            <li key={page.pageNumber}>
              <Tooltip
                content={
                  <>
                    <TipTitle>Trang {page.pageNumber}</TipTitle>
                    <TipText>
                      <span className="numeric">{page.count}</span> tiêu chí được
                      đánh dấu trên trang này.
                    </TipText>
                  </>
                }
              >
                <button
                  type="button"
                  data-active={isActive}
                  onClick={() => onSelectPage(page.pageNumber)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left
                             text-sm text-text-secondary transition-colors duration-150
                             hover:bg-surface-hover hover:text-text-primary
                             focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus
                             data-[active=true]:bg-surface-active data-[active=true]:font-medium data-[active=true]:text-text-primary"
                >
                  <span className="numeric">{page.pageNumber}</span>
                  <span className="flex items-center gap-1">
                    {STATUS_ORDER.filter((status) => page.statuses.includes(status)).map(
                      (status) => (
                        <span
                          key={status}
                          className={`size-1.5 shrink-0 rounded-full ${STATUS_CONFIG[status].bar}`}
                          aria-hidden
                        />
                      ),
                    )}
                  </span>
                </button>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
