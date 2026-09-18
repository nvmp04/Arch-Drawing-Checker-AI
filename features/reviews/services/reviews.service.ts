import { EMPTY_STATUS_COUNTS } from "@/shared/components/StatusStackedBar";
import { DRAFT_ASSIGNEE } from "../constants/review.constants";
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
 */

const MOCK_DELAY_MS = 400;

function resolveAfterDelay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let draftSequence = 0;

export const reviewsService = {
  listReviews(workspaceSlug: string): Promise<readonly Review[]> {
    void workspaceSlug;
    return resolveAfterDelay(MOCK_REVIEWS);
  },

  getReview(reviewId: string): Promise<Review | undefined> {
    const fromMock = MOCK_REVIEWS.find((review) => review.id === reviewId);
    return resolveAfterDelay(fromMock ?? readDraftReview(reviewId));
  },

  listStandardSets(): Promise<readonly ChtkStandardSet[]> {
    return resolveAfterDelay(MOCK_STANDARD_SETS);
  },

  listZoneOptions(): Promise<readonly ZoneOption[]> {
    return resolveAfterDelay(MOCK_ZONE_OPTIONS);
  },

  /**
   * MOCK — sau này là `POST /reviews` (multipart: file PDF + metadata), trả
   * về hồ sơ vừa tạo với `status: "processing"`.
   *
   * Ở giai đoạn mock chưa có nơi lưu chung giữa client và server, nên hồ sơ
   * tạm được cất thêm vào `sessionStorage` để trang xử lý đọc lại được sau
   * khi điều hướng sang — đây chỉ là cầu nối tạm thời, bỏ đi khi có backend
   * thật trả `Review` ngay trong response của lời gọi này.
   */
  createReview(input: CreateReviewInput): Promise<Review> {
    draftSequence += 1;
    const zone = MOCK_ZONE_OPTIONS.find((option) => option.id === input.zoneId);

    const review: Review = {
      id: `rv-draft-${Date.now()}-${draftSequence}`,
      code: `DRAFT-${String(draftSequence).padStart(3, "0")}`,
      name: input.name,
      status: "processing",
      processingState: "running",
      progressPercent: 0,
      pageCount: 0,
      zoneName: zone?.name ?? "Chưa phân khu",
      houseType: input.houseType,
      statusCounts: { ...EMPTY_STATUS_COUNTS },
      updatedAt: new Date().toISOString().slice(0, 10),
      assignee: DRAFT_ASSIGNEE,
    };

    saveDraftReview(review);
    return resolveAfterDelay(review, 300);
  },

  /** MOCK — khi có backend, phần này nằm trong payload trả về khi hồ sơ xử lý xong. */
  getCheckTypeBreakdown(
    reviewId: string,
  ): Promise<readonly ReviewCheckTypeBreakdown[]> {
    void reviewId;
    return resolveAfterDelay(MOCK_CHECK_TYPE_BREAKDOWN, 200);
  },
};

function draftReviewStorageKey(reviewId: string): string {
  return `review:draft:${reviewId}`;
}

function saveDraftReview(review: Review): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    draftReviewStorageKey(review.id),
    JSON.stringify(review),
  );
}

function readDraftReview(reviewId: string): Review | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = window.sessionStorage.getItem(draftReviewStorageKey(reviewId));
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Review;
  } catch {
    return undefined;
  }
}
