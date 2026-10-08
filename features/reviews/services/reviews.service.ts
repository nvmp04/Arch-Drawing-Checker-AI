import { MOCK_FINDINGS } from "@/features/findings/mocks/findings.mock";
import type { Finding } from "@/features/findings/types/finding.types";
import { ApiError, apiClient } from "@/shared/services/apiClient";
import { resolveAfterDelay } from "@/shared/utils/async";
import { MOCK_CHECK_TYPE_BREAKDOWN } from "../mocks/checkTypeBreakdown.mock";
import { MOCK_REVIEWS } from "../mocks/reviews.mock";
import { MOCK_STANDARD_SETS } from "../mocks/standardSets.mock";
import { MOCK_ZONE_OPTIONS } from "../mocks/zoneOptions.mock";
import type {
  ChtkStandardSet,
  CreateReviewInput,
  Review,
  ReviewCheckTypeBreakdown,
  ZoneOption,
} from "../types/review.types";

/**
 * Service của feature reviews. Mỗi hàm trả về `Promise`, đúng hình dạng lời
 * gọi API sau này — khi có backend chỉ cần thay phần thân hàm bằng
 * `apiClient.get/post(...)`, chữ ký giữ nguyên nên nơi gọi không phải sửa.
 *
 * **Đã nối thật** (hợp đồng `docs/contracts/fe-review-upload.md` của backend):
 * `createReview` và `getReview` cho hồ sơ tạo qua API. Còn lại vẫn mock.
 */

const MOCK_DELAY_MS = 400;

/** Dữ liệu đổ vào form tạo hồ sơ — gom một lời gọi thay vì hai. */
export type ReviewFormOptions = {
  zoneOptions: readonly ZoneOption[];
  standardSets: readonly ChtkStandardSet[];
};

export const reviewsService = {
  listReviews(workspaceSlug: string): Promise<readonly Review[]> {
    void workspaceSlug;
    return resolveAfterDelay(MOCK_REVIEWS, MOCK_DELAY_MS);
  },

  /**
   * Hồ sơ mock (id `rv-…`) đọc từ mock; hồ sơ còn lại hỏi
   * `GET /workspaces/:slug/reviews/:id`. Backend lưu trong bộ nhớ, khởi động
   * lại là mất — `404 REVIEW_NOT_FOUND` được coi là "không có hồ sơ"
   * (`undefined`), không phải lỗi.
   */
  async getReview(
    workspaceSlug: string,
    reviewId: string,
  ): Promise<Review | undefined> {
    const fromMock = MOCK_REVIEWS.find((review) => review.id === reviewId);
    if (fromMock) return resolveAfterDelay(fromMock, MOCK_DELAY_MS);

    try {
      return await apiClient.get<Review>(
        `/workspaces/${encodeURIComponent(workspaceSlug)}/reviews/${encodeURIComponent(reviewId)}`,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return undefined;
      throw error;
    }
  },

  /**
   * Tiêu chí của một hồ sơ.
   *
   * MOCK — sau này là `GET /reviews/:id/findings`. Đọc thẳng mock của feature
   * findings là đúng giới hạn D-17: `reviews` được import **type và mock** của
   * `findings`, nhưng không được mượn hook hay container của feature đó.
   *
   * D-12: chỉ hồ sơ `rv-2026-018` có đủ dữ liệu chi tiết; hồ sơ khác trả mảng
   * rỗng và khung xem sẽ hiện trạng thái trống — đó là dữ liệu hợp lệ, không
   * phải lỗi.
   */
  listReviewFindings(reviewId: string): Promise<readonly Finding[]> {
    const rows = MOCK_FINDINGS.filter((finding) => finding.reviewId === reviewId);
    return resolveAfterDelay(rows, MOCK_DELAY_MS);
  },

  listFormOptions(): Promise<ReviewFormOptions> {
    return resolveAfterDelay({
      zoneOptions: MOCK_ZONE_OPTIONS,
      standardSets: MOCK_STANDARD_SETS,
    });
  },

  /**
   * `POST /workspaces/:slug/reviews` — `multipart/form-data`. Trả `201` ngay khi
   * hồ sơ được tạo và việc phân tích đã gửi đi (chưa xong): `status` là
   * `"processing"`, nơi gọi điều hướng sang trang `/processing`.
   *
   * `categories` append lặp mỗi giá trị một lần. Không gửi trường nào khác —
   * backend trả `400` với trường thừa.
   */
  createReview(workspaceSlug: string, input: CreateReviewInput): Promise<Review> {
    const form = new FormData();
    form.append("file", input.file);
    form.append("name", input.name);
    form.append("zoneId", input.zoneId);
    form.append("ruleSetId", input.ruleSetId);
    form.append("houseType", input.houseType);
    input.categories.forEach((category) => form.append("categories", category));

    return apiClient.post<Review>(
      `/workspaces/${encodeURIComponent(workspaceSlug)}/reviews`,
      form,
    );
  },

  /** MOCK — khi có backend, phần này nằm trong payload trả về khi hồ sơ xử lý xong. */
  getCheckTypeBreakdown(
    reviewId: string,
  ): Promise<readonly ReviewCheckTypeBreakdown[]> {
    void reviewId;
    return resolveAfterDelay(MOCK_CHECK_TYPE_BREAKDOWN, 200);
  },
};
