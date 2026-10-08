/**
 * Phép tính số dùng chung. Không biết gì về miền bài toán — chỉ nhận số, trả số.
 *
 * Gom về đây vì ba công thức dưới đây trước đó nằm rải trong feature: `clamp`
 * viết cục bộ trong `DrawingPageViewer`, còn công thức tỷ lệ phần trăm bị chép
 * lại ở bốn chỗ (dashboard.service ×2, FindingResultPanel, ReviewListItem).
 */

/** Kẹp `value` vào đoạn `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Tỷ lệ phần trăm của `part` trên `whole`, làm tròn về số nguyên.
 *
 * Mẫu số bằng 0 (hoặc âm) trả về 0 thay vì `NaN`/`Infinity` — trang thống kê
 * luôn có trường hợp "chưa có tiêu chí nào kết luận được".
 */
export function percentOf(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

/** Đổi tỷ lệ 0–1 (độ tin cậy, ngưỡng) thành số phần trăm nguyên. */
export function ratioToPercent(ratio: number): number {
  return Math.round(ratio * 100);
}

/** Làm tròn tới `decimals` chữ số thập phân. */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
