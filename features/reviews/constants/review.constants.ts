import type { ChtkCategory } from "@/shared/constants/enums";
import type { ProcessingStepDef } from "../types/review.types";

export const UPLOAD_ACCEPT = "application/pdf";
export const MAX_FILE_SIZE_MB = 100;

/** Mô tả nhóm tiêu chí hiển thị ở khối chọn khi tạo hồ sơ mới. */
export const CATEGORY_CHECK_DESCRIPTIONS: Record<ChtkCategory, string> = {
  facade:
    "Hoàn thiện mặt tiền, phào chỉ, lan can, cửa đi, cửa sổ, cổng hàng rào, cote.",
  dimension:
    "Chiều cao tầng và bề rộng lọt lòng các phòng chức năng. Toàn số đo.",
  "stair-ramp":
    "Bề rộng vế thang, kích thước bậc, số bậc, độ dốc ramp hầm. Toàn số đo.",
  structure:
    "Kicker, ron âm, trát vữa, chống thấm, sàn mái, sê nô, khe hở giữa hai nhà.",
  finishing:
    "Trần thạch cao/silicate, hệ khung, chân tường, ngạch cửa, ốp đá.",
};

/**
 * Các bước mô phỏng quá trình AI đọc bản vẽ. Hiện chưa có backend nên chạy
 * bằng đồng hồ ở client (xem `useReviewProcessingStatus`) — khi có API trạng
 * thái xử lý thật, danh sách này vẫn giữ nguyên vai trò hiển thị.
 */
export const PROCESSING_STEPS: readonly ProcessingStepDef[] = [
  { key: "extract", label: "Trích xuất trang bản vẽ từ file PDF" },
  { key: "ocr", label: "OCR nhận diện kích thước, cote và ghi chú" },
  { key: "material", label: "Đối chiếu vật liệu / thông số theo ngữ cảnh" },
  { key: "geometry", label: "Phân tích hình học bằng VLM" },
  { key: "aggregate", label: "Tổng hợp kết luận theo từng tiêu chí CHTK" },
];

/** Người phụ trách mặc định cho hồ sơ vừa tạo — thay bằng người dùng đang đăng nhập khi có auth. */
export const DRAFT_ASSIGNEE = { name: "Bạn", initials: "B" };

/**
 * File PDF dùng chung cho mọi hồ sơ ở khung xem bản vẽ — chưa có backend lưu
 * file thật đã tải lên theo từng hồ sơ, nên tạm dùng chung một file thật
 * (bản vẽ mẫu PN2-DN-01, 48 trang) cho mọi hồ sơ. `scripts/generate-sample-pdf.mjs`
 * vẫn giữ lại làm phương án dự phòng khi không có file mẫu thật.
 */
export const MOCK_PDF_URL = "/mock/PN2-DN-01.pdf";

/**
 * Giới hạn zoom của khung xem bản vẽ, tính theo tỉ lệ so với mức "vừa khung"
 * (Deep Zoom / Map Viewport Pattern) — không phải giá trị scale tuyệt đối,
 * vì canvas render ở độ phân giải oversample (`RENDER_SCALE`) khác nhau tùy
 * kích thước trang thật.
 */
export const VIEWER_MIN_ZOOM_RATIO = 0.1;
export const VIEWER_MAX_ZOOM_RATIO = 20;
