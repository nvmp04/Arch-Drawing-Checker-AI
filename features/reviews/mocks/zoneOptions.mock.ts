import type { ZoneOption } from "../types/review.types";

/**
 * MOCK DATA — phân khu để chọn khi tạo hồ sơ thẩm định mới.
 *
 * Chưa có `GET /zones`, và backend (giai đoạn khả thi, chưa có CSDL) chỉ nhận
 * **đúng** id demo dưới đây khi tạo hồ sơ — id khác trả `404 ZONE_NOT_FOUND`.
 * Nguồn: `arch-drawing-checker-backend/docs/contracts/fe-review-upload.md` §0.1.
 */
export const MOCK_ZONE_OPTIONS: readonly ZoneOption[] = [
  { id: "b3f1c7a2-5d4e-4f6a-9c8b-2e1d0f3a4b01", name: "PN2 Đà Nẵng" },
];
