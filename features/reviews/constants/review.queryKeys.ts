/**
 * Khóa cache TanStack Query của feature reviews.
 *
 * Quy ước chung cho cả dự án: mỗi feature có một factory, khóa đi từ **rộng
 * tới hẹp** (`["reviews"]` → `["reviews", "list", slug]`). Nhờ vậy
 * `invalidateQueries({ queryKey: reviewKeys.all })` dọn sạch mọi query của
 * feature, còn `reviewKeys.lists()` chỉ dọn các danh sách mà giữ nguyên chi tiết.
 *
 * Không bao giờ viết mảng khóa thẳng trong hook — gõ nhầm một chữ là cache
 * tách đôi mà không có lỗi nào báo.
 */
export const reviewKeys = {
  all: ["reviews"] as const,

  lists: () => [...reviewKeys.all, "list"] as const,
  list: (workspaceSlug: string) => [...reviewKeys.lists(), workspaceSlug] as const,

  details: () => [...reviewKeys.all, "detail"] as const,
  detail: (reviewId: string) => [...reviewKeys.details(), reviewId] as const,

  /** Tiêu chí của một hồ sơ (xem D-17: reviews tự đọc mock, không mượn hook của findings). */
  findings: (reviewId: string) => [...reviewKeys.detail(reviewId), "findings"] as const,

  /** Phân rã theo loại kiểm tra, hiện ra khi trang xử lý chạy xong. */
  checkTypeBreakdown: (reviewId: string) =>
    [...reviewKeys.detail(reviewId), "check-type-breakdown"] as const,

  /** Dữ liệu đổ vào form tạo hồ sơ: danh sách phân khu + bộ tiêu chuẩn CHTK. */
  formOptions: () => [...reviewKeys.all, "form-options"] as const,
} as const;
