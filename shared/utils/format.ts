import { ratioToPercent } from "./number";

/**
 * Định dạng giá trị để hiển thị. Chuỗi trả về là chuỗi người đọc (tiếng Việt),
 * nên mọi hàm ở đây đều thuộc lớp hiển thị — không dùng để tính toán tiếp.
 */

/** Dung lượng file: dưới 1 MB thì tính theo KB, từ 1 MB trở lên lấy 1 chữ số thập phân. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Tỷ lệ 0–1 thành chuỗi phần trăm, ví dụ `0.87` → `"87%"`. */
export function formatPercent(ratio: number): string {
  return `${ratioToPercent(ratio)}%`;
}

/** Ngày hôm nay dạng `YYYY-MM-DD` — đúng dạng `Review.updatedAt` đang dùng. */
export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * ISO 8601 → `dd/MM/yyyy` theo giờ máy người dùng.
 *
 * Backend trả thời gian dạng ISO UTC đầy đủ (`2026-09-23T15:56:01.826Z`), in
 * thẳng ra màn hình thì không ai đọc. Dựng chuỗi bằng tay thay vì
 * `toLocaleDateString` để kết quả không phụ thuộc locale của máy.
 *
 * Chuỗi không parse được trả về nguyên văn — thà hiện dữ liệu lạ còn hơn hiện
 * "Invalid Date".
 */
export function formatIsoDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}
