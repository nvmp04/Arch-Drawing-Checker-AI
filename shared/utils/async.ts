/**
 * Tiện ích bất đồng bộ dùng chung cho tầng service.
 *
 * `resolveAfterDelay` là thứ giữ cho giai đoạn mock có cùng *hình dạng thời
 * gian* với API thật: lời gọi không trả về ngay, nên mọi trạng thái loading /
 * error dựng ở giai đoạn này đều nhìn thấy được. Khi nối backend thì thân hàm
 * service đổi sang `apiClient.get(...)`, và hàm này chỉ còn dùng cho mock/test.
 */

/** Độ trễ giả lập mặc định của service mock. */
export const MOCK_DELAY_MS = 300;

/** Trả `value` sau `ms` mili-giây. */
export function resolveAfterDelay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Chờ `ms` mili-giây. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
