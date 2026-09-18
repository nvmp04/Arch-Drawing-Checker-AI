"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@/shared/components/icons";
import { STATUS_CONFIG } from "@/shared/constants/domain";
import type { FindingStatus } from "@/shared/constants/enums";
import type { BoundingBox } from "@/features/findings/types/finding.types";
import { VIEWER_MAX_ZOOM_RATIO, VIEWER_MIN_ZOOM_RATIO } from "../constants/review.constants";

/**
 * Độ phân giải của lớp nền (canvas cả trang) — chỉ là lớp tạm hiện ngay lúc
 * đang zoom/kéo; hình nét thật do lớp chi tiết (render lại đúng mức zoom) đảm nhận.
 */
const RENDER_SCALE = 1.5;
/** Chờ người dùng dừng thao tác chừng này ms rồi mới render lại lớp chi tiết. */
const DETAIL_DEBOUNCE_MS = 140;
/** Chặn dpr để canvas chi tiết không phình quá lớn trên màn hình 3x/4x. */
const MAX_DPR = 2;
/** Lớp chi tiết vẽ rộng hơn khung xem mỗi phía chừng này (tỉ lệ) để kéo nhẹ không lộ mép lớp nền mờ. */
const DETAIL_OVERSCAN = 0.15;
/** Thời lượng hiệu ứng trượt khi zoom/nhảy tới vùng do code điều khiển (không phải do người dùng kéo). */
const ANIMATION_MS = 300;
/** Chặn an toàn để tránh NaN/Infinity khi box hoặc trang có kích thước bất thường. */
const SAFE_MIN_SCALE = 0.01;
const SAFE_MAX_SCALE = 60;

export type ViewerAnnotation = {
  id: string;
  /** Chỉ mục tiêu chí, ví dụ "1.1" — hiện ở góc khối khoanh. */
  ruleIndex: string;
  label: string;
  boundingBox: BoundingBox;
  status: FindingStatus;
};

type Transform = { scale: number; x: number; y: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function computeFitTransform(
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
  padding = 32,
): Transform {
  const scale = clamp(
    Math.min(
      (viewportWidth - padding * 2) / contentWidth,
      (viewportHeight - padding * 2) / contentHeight,
    ),
    SAFE_MIN_SCALE,
    SAFE_MAX_SCALE,
  );
  return {
    scale,
    x: (viewportWidth - contentWidth * scale) / 2,
    y: (viewportHeight - contentHeight * scale) / 2,
  };
}

function computeFocusTransform(
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
  box: BoundingBox,
  padding = 64,
): Transform {
  const boxWidth = (box.width / 100) * contentWidth;
  const boxHeight = (box.height / 100) * contentHeight;
  const boxCenterX = ((box.x + box.width / 2) / 100) * contentWidth;
  const boxCenterY = ((box.y + box.height / 2) / 100) * contentHeight;

  const scale = clamp(
    Math.min(
      (viewportWidth - padding * 2) / boxWidth,
      (viewportHeight - padding * 2) / boxHeight,
    ),
    SAFE_MIN_SCALE,
    SAFE_MAX_SCALE,
  );

  return {
    scale,
    x: viewportWidth / 2 - boxCenterX * scale,
    y: viewportHeight / 2 - boxCenterY * scale,
  };
}

/** Viền + nền mờ của khối khoanh, và viền của nhãn chỉ mục, theo màu trạng thái. */
const ANNOTATION_CLASS: Record<FindingStatus, { box: string; label: string }> = {
  fail: { box: "border-fail bg-fail/10 hover:bg-fail/20", label: "border-fail" },
  warning: { box: "border-warning bg-warning/10 hover:bg-warning/20", label: "border-warning" },
  pending: { box: "border-pending bg-pending/10 hover:bg-pending/20", label: "border-pending" },
  pass: { box: "border-pass bg-pass/10 hover:bg-pass/20", label: "border-pass" },
  approved: { box: "border-approved bg-approved/10 hover:bg-approved/20", label: "border-approved" },
  unknown: { box: "border-unknown bg-unknown/10 hover:bg-unknown/20", label: "border-unknown" },
};

/** Độ dày viền trên màn hình (px) — giữ cố định bất kể mức zoom. */
const ANNOTATION_BORDER_PX = 2;
const ANNOTATION_BORDER_SELECTED_PX = 3.5;

/**
 * Khung xem bản vẽ PDF — Deep Zoom / Map Viewport Pattern: phóng to/thu nhỏ
 * bằng cử chỉ chụm / nút bấm, kéo rê để di chuyển. Hai lớp canvas:
 * - lớp nền: cả trang ở độ phân giải thấp, pan/zoom bằng CSS transform cho
 *   phản hồi tức thì;
 * - lớp chi tiết: khi người dùng dừng thao tác, pdf.js render lại đúng vùng
 *   đang nhìn ở đúng mức zoom (× devicePixelRatio) nên nét vector luôn sắc.
 *
 * Vùng khoanh (`annotations`) định vị theo phần trăm kích thước trang nên tự
 * động theo đúng transform của canvas, không cần tính lại khi zoom/pan.
 */
export function DrawingPageViewer({
  pdfUrl,
  pageNumber,
  pageCount,
  annotations,
  selectedAnnotationId,
  focusBoundingBox,
  focusKey,
  onSelectAnnotation,
  onPageChange,
}: {
  pdfUrl: string;
  pageNumber: number;
  pageCount: number;
  annotations: readonly ViewerAnnotation[];
  selectedAnnotationId?: string;
  focusBoundingBox?: BoundingBox;
  /** Đổi giá trị này để buộc tính lại zoom, kể cả khi target trùng lần trước. */
  focusKey: string;
  onSelectAnnotation?: (id: string) => void;
  onPageChange: (nextPage: number) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // pdfjs-dist chỉ nạp được ở client — kiểu để `unknown`, ép kiểu cục bộ khi dùng.
  const pdfDocRef = useRef<{
    getPage: (n: number) => Promise<{
      getViewport: (opts: {
        scale: number;
        offsetX?: number;
        offsetY?: number;
      }) => { width: number; height: number };
      render: (opts: {
        canvasContext: CanvasRenderingContext2D;
        viewport: unknown;
        background?: string;
      }) => { promise: Promise<void>; cancel: () => void };
    }>;
  } | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  // Hai canvas chi tiết dùng luân phiên (double buffer): vẽ vào cái đang ẩn,
  // xong mới đổi cái hiện — để nội dung mới và transform của nó đổi cùng một lần
  // commit, không bao giờ có khung hình nội dung mới nằm sai vị trí (tàn ảnh).
  const detailCanvasARef = useRef<HTMLCanvasElement>(null);
  const detailCanvasBRef = useRef<HTMLCanvasElement>(null);
  const activeDetailSlotRef = useRef<0 | 1>(1);
  const detailTaskRef = useRef<{ cancel: () => void } | null>(null);
  const detailRequestRef = useRef(0);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number; page: number } | null>(null);
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [fitScale, setFitScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  /** Chỉ bật transition khi code tự di chuyển khung nhìn; thao tác của người dùng luôn tức thì. */
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasFittedRef = useRef(false);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number } | null>(null);
  /** Lớp chi tiết đã vẽ xong: render ở transform (x, y, scale) cho trang `page`. */
  const [detail, setDetail] = useState<{
    page: number;
    x: number;
    y: number;
    scale: number;
    dpr: number;
    /** Kích thước phần nhìn thấy (css px), chưa tính lề overscan. */
    cssWidth: number;
    cssHeight: number;
    marginX: number;
    marginY: number;
    slot: 0 | 1;
  } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    clearTimeout(animationTimerRef.current);
    animationTimerRef.current = setTimeout(() => setIsAnimating(false), ANIMATION_MS + 40);
  }, []);

  /** Người dùng chạm vào: dừng hiệu ứng đang chạy và bỏ dở việc render lớp chi tiết. */
  const beginUserInteraction = useCallback(() => {
    clearTimeout(animationTimerRef.current);
    setIsAnimating(false);
    detailRequestRef.current += 1;
    detailTaskRef.current?.cancel();
  }, []);

  // Nạp file PDF một lần theo pdfUrl.
  useEffect(() => {
    let cancelled = false;

    import("pdfjs-dist")
      .then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        return pdfjsLib.getDocument({ url: pdfUrl }).promise;
      })
      .then((doc) => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pdfDocRef.current = doc as any;
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Không tải được file bản vẽ.");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  const renderPage = useCallback(async (num: number) => {
    const doc = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;

    renderTaskRef.current?.cancel();

    const page = await doc.getPage(num);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    // Kích thước hiển thị chính xác (không làm tròn) để khớp tuyệt đối với lớp
    // chi tiết và vùng khoanh tính theo %.
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;
    try {
      await task.promise;
    } catch (err) {
      if ((err as { name?: string })?.name === "RenderingCancelledException") return;
      throw err;
    }
    renderTaskRef.current = null;
    setNaturalSize({ width: viewport.width, height: viewport.height, page: num });
  }, []);

  // Render lại canvas khi đổi trang (sau khi PDF đã sẵn sàng).
  useEffect(() => {
    if (isLoading || loadError) return;
    renderPage(pageNumber).catch(() => setLoadError("Không đọc được trang này."));
  }, [isLoading, loadError, pageNumber, renderPage]);

  // Tính lại transform: fit cả trang theo mặc định, hoặc zoom vào focusBoundingBox.
  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!naturalSize || !viewportEl) return;
    const rect = viewportEl.getBoundingClientRect();

    const fit = computeFitTransform(rect.width, rect.height, naturalSize.width, naturalSize.height);
    setFitScale(fit.scale);

    // Lần fit đầu tiên hiện tức thì; các lần sau (nhảy trang, zoom vào vùng) mới trượt.
    if (hasFittedRef.current) startAnimation();
    hasFittedRef.current = true;

    setTransform(
      focusBoundingBox
        ? computeFocusTransform(rect.width, rect.height, naturalSize.width, naturalSize.height, focusBoundingBox)
        : fit,
    );
    // focusBoundingBox cố tình không nằm trong dependency — dùng focusKey để
    // tránh tính lại khi tham chiếu box đổi nhưng nội dung logic không đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalSize, focusKey]);

  // Theo dõi kích thước khung xem để lớp chi tiết luôn phủ kín khung.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Lớp chi tiết: khi người dùng dừng zoom/kéo, render lại trang bằng pdf.js ĐÚNG
  // mức zoom hiện tại, chỉ trong phạm vi khung xem, rồi phủ lên lớp nền. Nhờ đó
  // nét vector luôn sắc ở mọi mức phóng đại thay vì kéo giãn ảnh bitmap có sẵn.
  useEffect(() => {
    if (isLoading || loadError || !viewportSize || isDragging) return;
    if (!naturalSize || naturalSize.page !== pageNumber) return;
    const { x, y, scale } = transform;

    const timer = setTimeout(async () => {
      const doc = pdfDocRef.current;
      const slot: 0 | 1 = activeDetailSlotRef.current === 0 ? 1 : 0;
      const target = (slot === 0 ? detailCanvasARef : detailCanvasBRef).current;
      if (!doc || !target) return;

      const requestId = ++detailRequestRef.current;
      detailTaskRef.current?.cancel();

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const cssWidth = Math.round(viewportSize.width);
      const cssHeight = Math.round(viewportSize.height);
      const marginX = Math.round(cssWidth * DETAIL_OVERSCAN);
      const marginY = Math.round(cssHeight * DETAIL_OVERSCAN);
      // Số px màn hình (css) trên mỗi đơn vị điểm của PDF ở mức zoom hiện tại.
      const pixelsPerPoint = RENDER_SCALE * scale;

      try {
        const page = await doc.getPage(pageNumber);
        if (requestId !== detailRequestRef.current) return;

        // Đặt lại kích thước cũng xóa canvas — an toàn vì canvas này đang ẩn.
        target.width = Math.round((cssWidth + marginX * 2) * dpr);
        target.height = Math.round((cssHeight + marginY * 2) * dpr);
        const ctx = target.getContext("2d");
        if (!ctx) return;

        // Tô giấy trắng đúng vùng trang để lớp này che kín lớp nền mờ bên dưới,
        // không để nét mờ của lớp nền lộ ra quanh nét sắc.
        ctx.fillStyle =
          getComputedStyle(document.documentElement).getPropertyValue("--canvas-paper").trim() || "white";
        ctx.fillRect(
          dpr * (x + marginX),
          dpr * (y + marginY),
          dpr * naturalSize.width * scale,
          dpr * naturalSize.height * scale,
        );

        const task = page.render({
          canvasContext: ctx,
          viewport: page.getViewport({
            scale: dpr * pixelsPerPoint,
            offsetX: dpr * (x + marginX),
            offsetY: dpr * (y + marginY),
          }),
          background: "rgba(0,0,0,0)",
        });
        detailTaskRef.current = task;
        await task.promise;
        if (requestId !== detailRequestRef.current) return;

        activeDetailSlotRef.current = slot;
        setDetail({ page: pageNumber, x, y, scale, dpr, cssWidth, cssHeight, marginX, marginY, slot });
      } catch {
        // Render bị hủy hoặc lỗi — giữ nguyên lớp đang hiện, lần thao tác sau sẽ thử lại.
      }
    }, DETAIL_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [isLoading, loadError, viewportSize, naturalSize, pageNumber, transform, isDragging]);

  useEffect(
    () => () => {
      detailRequestRef.current += 1;
      detailTaskRef.current?.cancel();
    },
    [],
  );

  // Wheel: lướt 2 ngón trên touchpad (hoặc con lăn) → kéo rê; chụm 2 ngón hoặc
  // Ctrl + lăn → zoom (trình duyệt gửi cử chỉ chụm dưới dạng wheel có ctrlKey).
  // Cần listener native để preventDefault hoạt động (React đăng ký onWheel ở
  // root với passive: true).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      beginUserInteraction();

      const lineToPx = event.deltaMode === 1 ? 16 : 1;
      const deltaX = event.deltaX * lineToPx;
      const deltaY = event.deltaY * lineToPx;

      if (!event.ctrlKey) {
        setTransform((prev) => ({ ...prev, x: prev.x - deltaX, y: prev.y - deltaY }));
        return;
      }

      const rect = el.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;
      setTransform((prev) => {
        const nextScale = clamp(
          prev.scale * Math.exp(-clamp(deltaY, -40, 40) * 0.01),
          fitScale * VIEWER_MIN_ZOOM_RATIO,
          fitScale * VIEWER_MAX_ZOOM_RATIO,
        );
        const ratio = nextScale / prev.scale;
        return {
          scale: nextScale,
          x: cursorX - (cursorX - prev.x) * ratio,
          y: cursorY - (cursorY - prev.y) * ratio,
        };
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [fitScale, beginUserInteraction]);

  const zoomBy = (factor: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    startAnimation();
    setTransform((prev) => {
      const nextScale = clamp(
        prev.scale * factor,
        fitScale * VIEWER_MIN_ZOOM_RATIO,
        fitScale * VIEWER_MAX_ZOOM_RATIO,
      );
      const ratio = nextScale / prev.scale;
      return { scale: nextScale, x: cx - (cx - prev.x) * ratio, y: cy - (cy - prev.y) * ratio };
    });
  };

  const resetToFit = () => {
    const el = viewportRef.current;
    if (!naturalSize || !el) return;
    const rect = el.getBoundingClientRect();
    startAnimation();
    setTransform(computeFitTransform(rect.width, rect.height, naturalSize.width, naturalSize.height));
  };

  const onPointerDown = (event: React.PointerEvent) => {
    beginUserInteraction();
    (event.target as Element).setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.x,
      originY: transform.y,
    };
    setIsDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setTransform((prev) => ({ ...prev, x: drag.originX + dx, y: drag.originY + dy }));
  };

  const endDrag = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const contentStyle = {
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
    transformOrigin: "0 0",
    width: naturalSize?.width,
    height: naturalSize?.height,
  };
  const layerMotion = isAnimating ? "transition-transform duration-300 ease-out" : "";

  // Lớp chi tiết đứng ở transform lúc render (`detail`); khi người dùng vừa
  // zoom/kéo thì nó được dịch/co giãn theo phần chênh lệch, và chỉ hiện khi vẫn
  // còn nét hơn lớp nền (hoặc còn gần mức zoom lúc render).
  const detailRatio = detail ? transform.scale / detail.scale : 1;
  const showDetail =
    !!detail &&
    detail.page === pageNumber &&
    !isAnimating &&
    ((detailRatio >= 0.7 && detailRatio <= 1.4) || detail.dpr / detailRatio >= 1 / transform.scale);

  const zoomPercent =Math.round((transform.scale / fitScale) * 100);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-surface-raised shadow-ds-small">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            aria-label="Trang trước"
            className="inline-flex size-7 items-center justify-center rounded-md text-text-secondary
                       transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                       disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <span className="numeric whitespace-nowrap text-sm text-text-secondary">
            Trang {pageNumber}/{pageCount}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= pageCount}
            aria-label="Trang sau"
            className="inline-flex size-7 items-center justify-center rounded-md text-text-secondary
                       transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus
                       disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.3)}
            aria-label="Thu nhỏ"
            className="inline-flex size-7 items-center justify-center rounded-md text-text-secondary
                       transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            <ZoomOutIcon className="size-4" />
          </button>
          <span className="numeric w-12 text-center text-xs text-text-muted">{zoomPercent}%</span>
          <button
            type="button"
            onClick={() => zoomBy(1.3)}
            aria-label="Phóng to"
            className="inline-flex size-7 items-center justify-center rounded-md text-text-secondary
                       transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            <ZoomInIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={resetToFit}
            aria-label="Vừa khung"
            title="Vừa khung"
            className="inline-flex size-7 items-center justify-center rounded-md text-text-secondary
                       transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            <MaximizeIcon className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`relative flex-1 touch-none overflow-hidden bg-canvas-backdrop ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {isLoading && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
            Đang tải bản vẽ...
          </p>
        )}
        {loadError && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-fail-text">
            {loadError}
          </p>
        )}

        {/* Lớp nền: cả trang ở độ phân giải thấp, hiện ngay khi đang zoom/kéo. */}
        <div style={contentStyle} className={`absolute left-0 top-0 will-change-transform ${layerMotion}`}>
          <canvas ref={canvasRef} className="block bg-canvas-paper" />
        </div>

        {/* Lớp chi tiết (2 canvas luân phiên): render lại đúng mức zoom nên nét luôn sắc. */}
        {([0, 1] as const).map((slot) => {
          const isActive = detail?.slot === slot;
          return (
            <canvas
              key={slot}
              ref={slot === 0 ? detailCanvasARef : detailCanvasBRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 will-change-transform"
              style={{
                width: isActive && detail ? detail.cssWidth + detail.marginX * 2 : undefined,
                height: isActive && detail ? detail.cssHeight + detail.marginY * 2 : undefined,
                transformOrigin: "0 0",
                transform:
                  isActive && detail
                    ? `translate(${transform.x - (detail.x + detail.marginX) * detailRatio}px, ${transform.y - (detail.y + detail.marginY) * detailRatio}px) scale(${detailRatio})`
                    : undefined,
                visibility: isActive && showDetail ? "visible" : "hidden",
              }}
            />
          );
        })}

        {/* Lớp vùng khoanh: cùng transform với lớp nền, nằm trên cùng để bấm được. */}
        <div style={contentStyle} className={`absolute left-0 top-0 ${layerMotion}`}>
          {annotations.map((annotation) => {
            const isSelected = annotation.id === selectedAnnotationId;
            const statusLabel = STATUS_CONFIG[annotation.status].label;
            const { box, label } = ANNOTATION_CLASS[annotation.status];
            // Khối nằm trong vùng bị scale, nên viền và nhãn phải chia ngược cho
            // scale để luôn giữ kích thước cố định trên màn hình.
            const inverse = 1 / transform.scale;
            const motion = isAnimating ? "transition-[transform,border-width] duration-300 ease-out" : "";

            return (
              <button
                key={annotation.id}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectAnnotation?.(annotation.id);
                }}
                title={`${annotation.label} — ${statusLabel}`}
                aria-label={`${annotation.label} — ${statusLabel}`}
                className={`absolute border-solid ${box} ${motion}`}
                style={{
                  left: `${annotation.boundingBox.x}%`,
                  top: `${annotation.boundingBox.y}%`,
                  width: `${annotation.boundingBox.width}%`,
                  height: `${annotation.boundingBox.height}%`,
                  borderWidth: `${(isSelected ? ANNOTATION_BORDER_SELECTED_PX : ANNOTATION_BORDER_PX) * inverse}px`,
                }}
              >
                <span
                  className={`numeric absolute bottom-full left-0 origin-bottom-left whitespace-nowrap border border-solid
                              bg-canvas-paper px-1 text-xs font-semibold leading-5 text-canvas-ink ${label} ${motion}`}
                  style={{
                    transform: `scale(${inverse})`,
                    marginLeft: `${-(isSelected ? ANNOTATION_BORDER_SELECTED_PX : ANNOTATION_BORDER_PX) * inverse}px`,
                    marginBottom: `${(isSelected ? ANNOTATION_BORDER_SELECTED_PX : ANNOTATION_BORDER_PX) * inverse}px`,
                  }}
                >
                  {annotation.ruleIndex}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
