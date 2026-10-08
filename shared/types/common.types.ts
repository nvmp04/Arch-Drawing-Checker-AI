/** Kiểu dùng chung cho mọi feature. Không chứa kiểu thuộc về một miền cụ thể. */

export type BaseEntity = { id: string };

/** Vỏ bọc chuẩn của response — backend trả dữ liệu thật trong trường `data`. */
export type ApiResponse<T> = { data: T };

export type Pagination = { page: number; pageSize: number; total: number };

/** Một trang kết quả: danh sách + thông tin phân trang. */
export type Paginated<T> = { items: readonly T[]; pagination: Pagination };

/**
 * Bốn trạng thái bắt buộc của mọi vùng dữ liệu (xem `ui-conventions.md` §7).
 * Giữ ở đây làm từ vựng chung khi mô tả UI, không phải state máy chạy.
 */
export type DataViewState = "loading" | "empty" | "error" | "data";
