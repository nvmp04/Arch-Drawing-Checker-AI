"use client";

import { useMemo, useState } from "react";

import type { Finding } from "@/features/findings/types/finding.types";
import { AlertTriangleIcon, DownloadIcon } from "@/shared/components/icons";
import { HOUSE_TYPE_CONFIG, STATUS_ORDER } from "@/shared/constants/domain";
import { MOCK_PDF_URL } from "../constants/review.constants";
import { exportAnnotatedPdf } from "../services/annotatedPdf.service";
import type { Review } from "../types/review.types";
import { DrawingPageViewer, type ViewerAnnotation } from "./DrawingPageViewer";
import { FindingResultPanel } from "./FindingResultPanel";
import { MarkedPageList, type MarkedPage } from "./MarkedPageList";

type FindingOverride = Partial<Pick<Finding, "status" | "note">>;

/**
 * Trang làm việc của một hồ sơ thẩm định: khung xem bản vẽ (trái) đồng bộ hai
 * chiều với danh sách trang đánh dấu và khung kết quả thẩm định (phải).
 * Toàn bộ state (finding đang chọn, trang hiện tại, xác nhận/ghi chú) giữ ở
 * đây — chưa có backend nên chỉ là override cục bộ, mất khi tải lại trang.
 */
export function ReviewWorkspace({
  review,
  findings: initialFindings,
}: {
  review: Review;
  findings: readonly Finding[];
}) {
  const [overrides, setOverrides] = useState<Readonly<Record<string, FindingOverride>>>({});

  const findings = useMemo(
    () =>
      initialFindings.map((finding) =>
        overrides[finding.id] ? { ...finding, ...overrides[finding.id] } : finding,
      ),
    [initialFindings, overrides],
  );

  const [currentPage, setCurrentPage] = useState(() =>
    findings.length > 0 ? Math.min(...findings.map((f) => f.pageNumber)) : 1,
  );
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const markedPages: readonly MarkedPage[] = useMemo(() => {
    const byPage = new Map<number, Finding[]>();
    for (const finding of findings) {
      const list = byPage.get(finding.pageNumber) ?? [];
      list.push(finding);
      byPage.set(finding.pageNumber, list);
    }
    return Array.from(byPage.entries())
      .sort(([a], [b]) => a - b)
      .map(([pageNumber, items]) => ({
        pageNumber,
        count: items.length,
        statuses: STATUS_ORDER.filter((status) => items.some((f) => f.status === status)),
      }));
  }, [findings]);

  const pageAnnotations: readonly ViewerAnnotation[] = useMemo(
    () =>
      findings
        .filter((finding) => finding.pageNumber === currentPage)
        .map((finding) => ({
          id: finding.id,
          ruleIndex: finding.ruleIndex,
          label: `${finding.ruleIndex} ${finding.detailLabel}`,
          boundingBox: finding.boundingBox,
          status: finding.status,
        })),
    [findings, currentPage],
  );

  const selectedFinding = findings.find((finding) => finding.id === selectedFindingId);
  const focusOnSelected = selectedFinding && selectedFinding.pageNumber === currentPage;
  const focusBoundingBox = focusOnSelected ? selectedFinding.boundingBox : undefined;
  const focusKey = focusOnSelected ? `finding:${selectedFinding.id}` : `page:${currentPage}`;

  const handleSelectFinding = (id: string) => {
    const finding = findings.find((f) => f.id === id);
    if (!finding) return;
    setSelectedFindingId(id);
    setCurrentPage(finding.pageNumber);
  };

  const handleSelectPage = (pageNumber: number) => {
    setSelectedFindingId(undefined);
    setCurrentPage(pageNumber);
  };

  const handlePageChange = (nextPage: number) => {
    setSelectedFindingId(undefined);
    setCurrentPage(Math.min(Math.max(nextPage, 1), Math.max(review.pageCount, 1)));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      await exportAnnotatedPdf({
        pdfUrl: MOCK_PDF_URL,
        findings,
        fileName: `${review.code}-danh-dau.pdf`,
      });
    } catch {
      setExportError("Không tạo được file PDF đánh dấu. Thử lại sau.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirm = (id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], status: "approved" } }));
  };

  const handleSaveNote = (id: string, note: string) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], note: note || undefined } }));
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h1 className="truncate text-lg font-semibold tracking-tight text-text-primary">{review.name}</h1>
          <p className="text-xs text-text-muted">
            <span className="numeric">{review.code}</span> · {review.zoneName} ·{" "}
            {HOUSE_TYPE_CONFIG[review.houseType].label}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || findings.length === 0}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-text-on-accent
                       transition-colors duration-150 hover:bg-accent-hover
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DownloadIcon className="size-4" />
            {isExporting ? "Đang tạo PDF..." : "Tải PDF đánh dấu"}
          </button>
          {exportError && (
            <p className="flex items-center gap-1 text-xs text-fail-text">
              <AlertTriangleIcon className="size-3.5 shrink-0" />
              {exportError}
            </p>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="w-28 shrink-0">
          <MarkedPageList
            pages={markedPages}
            activePage={currentPage}
            onSelectPage={handleSelectPage}
          />
        </div>

        <div className="min-w-0 flex-1">
          <DrawingPageViewer
            pdfUrl={MOCK_PDF_URL}
            pageNumber={currentPage}
            pageCount={Math.max(review.pageCount, 1)}
            annotations={pageAnnotations}
            selectedAnnotationId={selectedFindingId}
            focusBoundingBox={focusBoundingBox}
            focusKey={focusKey}
            onSelectAnnotation={handleSelectFinding}
            onPageChange={handlePageChange}
          />
        </div>

        <div className="w-[360px] shrink-0">
          <FindingResultPanel
            findings={findings}
            selectedFindingId={selectedFindingId}
            onSelectFinding={handleSelectFinding}
            onConfirmFinding={handleConfirm}
            onSaveNote={handleSaveNote}
          />
        </div>
      </div>
    </div>
  );
}
