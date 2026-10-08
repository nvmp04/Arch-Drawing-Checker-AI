/**
 * Đọc/ghi Web Storage an toàn.
 *
 * Hai thứ phải luôn bọc, và trước đây mỗi nơi tự bọc một kiểu:
 * - **Chạy trên server**: `window` không tồn tại khi Next render phía server.
 * - **Trình duyệt chặn storage**: chế độ ẩn danh hoặc cấu hình chặn cookie làm
 *   `getItem`/`setItem` ném lỗi chứ không trả `null`.
 *
 * Mọi hàm ở đây thất bại êm: đọc không được trả `undefined`, ghi không được thì
 * bỏ qua. Không dùng cho dữ liệu bắt buộc phải bền.
 */

type StorageKind = "local" | "session";

function getStorage(kind: StorageKind): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function readStorageItem(
  kind: StorageKind,
  key: string,
): string | undefined {
  try {
    return getStorage(kind)?.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
}

export function writeStorageItem(
  kind: StorageKind,
  key: string,
  value: string,
): void {
  try {
    getStorage(kind)?.setItem(key, value);
  } catch {
    // Storage bị chặn hoặc đầy — bỏ qua.
  }
}

export function removeStorageItem(kind: StorageKind, key: string): void {
  try {
    getStorage(kind)?.removeItem(key);
  } catch {
    // Như trên.
  }
}

/** Đọc và `JSON.parse`. JSON hỏng trả `undefined` thay vì ném lỗi. */
export function readStorageJson<T>(
  kind: StorageKind,
  key: string,
): T | undefined {
  const raw = readStorageItem(kind, key);
  if (raw === undefined) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/** `JSON.stringify` rồi ghi. */
export function writeStorageJson(
  kind: StorageKind,
  key: string,
  value: unknown,
): void {
  try {
    writeStorageItem(kind, key, JSON.stringify(value));
  } catch {
    // Giá trị có vòng tham chiếu — bỏ qua.
  }
}
