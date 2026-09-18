import type { ZoneOption } from "../types/review.types";

/**
 * MOCK DATA — phân khu để chọn khi tạo hồ sơ thẩm định mới.
 * Khớp tên với `zoneName` đang dùng trong `reviews.mock.ts`.
 * Khi có backend, đây là `GET /zones`.
 */
export const MOCK_ZONE_OPTIONS: readonly ZoneOption[] = [
  { id: "zn-pn2-dn", name: "PN2 Đà Nẵng" },
  { id: "zn-vs1-hcm", name: "Vinhomes Sunrise HCM" },
  { id: "zn-ar3-hn", name: "An Riverside Hà Nội" },
];
