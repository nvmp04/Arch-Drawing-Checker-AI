import { resolveAfterDelay } from "@/shared/utils/async";
import { MOCK_DOSSIERS, MOCK_FINDINGS } from "../mocks/findings.mock";
import type { Finding, ReviewDossier } from "../types/finding.types";

/**
 * Service của feature findings. Mỗi hàm trả `Promise`, đúng hình dạng lời gọi
 * API sau này — khi có backend chỉ cần thay phần thân hàm bằng
 * `apiClient.get(...)`, chữ ký giữ nguyên nên hook và container không phải sửa.
 */

/** Dữ liệu của trang "Kết quả tiêu chí": cây hồ sơ + toàn bộ tiêu chí đã đối chiếu. */
export type FindingListPayload = {
  dossiers: readonly ReviewDossier[];
  findings: readonly Finding[];
};

export const findingsService = {
  /**
   * MOCK — sau này là `GET /workspaces/:slug/findings`, trả về cả hai nhánh
   * trong một response để cây ba cấp dựng được trong một lần tải.
   */
  listFindings(workspaceSlug: string): Promise<FindingListPayload> {
    void workspaceSlug;
    return resolveAfterDelay({
      dossiers: MOCK_DOSSIERS,
      findings: MOCK_FINDINGS,
    });
  },
};
