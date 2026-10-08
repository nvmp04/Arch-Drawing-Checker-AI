/**
 * Lớp mỏng bọc `fetch`, là **điểm nối backend duy nhất** của dự án.
 *
 * Hợp đồng lấy từ `docs/api/conventions.md` của repo backend:
 *
 * - Thành công một đối tượng / mảng: `{ "data": T }`
 * - Thành công có phân trang:        `{ "data": T[], "meta": { page, pageSize, total } }`
 * - Lỗi (mọi loại):                  `{ "error": { statusCode, code, message, details?, path, timestamp } }`
 *
 * `error.message` là **tiếng Việt, hiển thị thẳng được cho người dùng** — đừng
 * thay bằng câu tự chế. `error.code` là UPPER_SNAKE để nơi gọi `switch`.
 */

/**
 * Gốc của API. Backend mặc định chạy ở cổng 4000 với tiền tố `/api/v1`.
 * Đổi bằng `NEXT_PUBLIC_API_BASE_URL` trong `.env.local`.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/** Hình dạng lỗi backend trả về. */
type ErrorEnvelope = {
  error?: {
    statusCode?: number;
    code?: string;
    message?: string;
    details?: readonly string[];
  };
};

export class ApiError extends Error {
  readonly status: number;
  /** Mã UPPER_SNAKE của backend, ví dụ `EXCEL_HEADER_NOT_FOUND`. Rỗng khi lỗi mạng. */
  readonly code: string;
  /** Chỉ có ở `VALIDATION_FAILED` — thông báo từng trường. */
  readonly details: readonly string[];
  readonly payload: unknown;

  constructor({
    message,
    status,
    code = "",
    details = [],
    payload,
  }: {
    message: string;
    status: number;
    code?: string;
    details?: readonly string[];
    payload?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.payload = payload;
  }

  /**
   * Endpoint mới có khung, chưa hiện thực. Không phải lỗi hệ thống — giao diện
   * nên báo "tính năng chưa sẵn sàng" và **không** mời thử lại.
   */
  get isNotImplemented(): boolean {
    return this.status === 501 || this.code === "NOT_IMPLEMENTED";
  }

  /** Lỗi client (4xx) thì thử lại cũng vô ích — TanStack Query dựa vào đây để quyết định retry. */
  get isRetryable(): boolean {
    return this.status === 0 || this.status === 408 || this.status >= 500;
  }
}

type RequestOptions = {
  /** Tham số query. Giá trị `undefined` / `null` bị bỏ qua; mảng gửi lặp khóa. */
  params?: Readonly<
    Record<
      string,
      string | number | boolean | undefined | null | readonly (string | number)[]
    >
  >;
  signal?: AbortSignal;
  headers?: Readonly<Record<string, string>>;
};

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = `${API_BASE_URL}${path}`;
  if (!params) return url;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    // Bộ lọc dạng mảng gửi lặp khóa (`?status=fail&status=warning`) — conventions §5.
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item));
    } else {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.params), {
      method,
      signal: options.signal,
      headers: {
        // FormData: KHÔNG tự đặt Content-Type, để trình duyệt sinh boundary.
        ...(isFormData
          ? {}
          : body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
        ...options.headers,
      },
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    // Mất mạng, DNS hỏng, hoặc request bị hủy — chưa có status nào để đọc.
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError({
      message: "Không kết nối được tới máy chủ.",
      status: 0,
      payload: cause,
    });
  }

  const payload = await readBody(response);

  if (!response.ok) throw toApiError(response.status, payload);

  // Backend bọc dữ liệu trong `{ data }`; response rỗng (204) trả về undefined.
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function toApiError(status: number, payload: unknown): ApiError {
  const envelope =
    payload && typeof payload === "object" ? (payload as ErrorEnvelope).error : undefined;

  return new ApiError({
    message: envelope?.message ?? `Máy chủ trả về lỗi ${status}.`,
    status: envelope?.statusCode ?? status,
    code: envelope?.code ?? "",
    details: envelope?.details ?? [],
    payload,
  });
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>("POST", path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>("PUT", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>("PATCH", path, body, options),

  delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>("DELETE", path, undefined, options),
};
