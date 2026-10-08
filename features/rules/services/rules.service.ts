import { categoryFromRuleIndex } from "@/shared/constants/domain";
import { apiClient } from "@/shared/services/apiClient";
import { resolveAfterDelay } from "@/shared/utils/async";
// MOCK ĐÃ KHÓA — xem chú thích "Vì sao mock bị khóa" bên dưới.
// import { MOCK_RULES } from "../mocks/rules.mock";
// import { MOCK_STANDARD_SETS } from "../mocks/standardSets.mock";
import type {
  CreateRuleInput,
  Rule,
  RuleSet,
  StandardSet,
} from "../types/rule.types";

/**
 * Service của feature rules — **đã nối backend thật** cho việc nạp Excel.
 *
 * ## Vì sao mock bị khóa
 *
 * `MOCK_RULES` (67 tiêu chí) và `MOCK_STANDARD_SETS` mô tả một hình dạng dữ
 * liệu **không tồn tại**: chúng điền đủ `code`, `checkType`, `operator`,
 * `value` cho mọi dòng. Dữ liệu thật từ file CHTK thì `checkType` null 92/92,
 * `operator`/`value` null 62/92, `code` null 41/92. Giữ mock hiển thị song song
 * sẽ dựng giao diện theo một thực tế sai. Hai file mock vẫn còn trên đĩa để đối
 * chiếu, nhưng không nơi nào import.
 *
 * ## Bộ nhớ phiên
 *
 * `GET /{ws}/rules` và `GET /{ws}/rules/:id` hiện trả **501** — backend đọc
 * được Excel nhưng **chưa lưu CSDL**. Nên bộ vừa nạp được giữ trong biến
 * module dưới đây: đủ để xem ngay sau khi nạp và đi qua lại giữa các trang,
 * **mất khi tải lại trang** — đúng với việc máy chủ thật sự chưa lưu gì.
 *
 * Bỏ `sessionRuleSets` khi backend gỡ 501; lúc đó hai hàm `list*` chỉ còn một
 * lời gọi `apiClient.get`, chữ ký giữ nguyên nên hook và container không sửa.
 */

/** Các bộ đã nạp trong phiên này, theo không gian làm việc. Mới nhất lên đầu. */
const sessionRuleSets = new Map<string, RuleSet[]>();

function setsOf(workspaceSlug: string): RuleSet[] {
  return sessionRuleSets.get(workspaceSlug) ?? [];
}

function toSummary(set: RuleSet): StandardSet {
  return {
    id: set.id,
    name: set.name,
    fileName: set.fileName,
    sheetName: set.sheetName,
    ruleCount: set.ruleCount,
    uploadedAt: set.uploadedAt,
  };
}

let draftSequence = 0;

export const rulesService = {
  /**
   * Danh sách bộ tiêu chuẩn đã nạp.
   *
   * Sẽ là `GET /workspaces/:slug/rules` (→ `RuleSetSummaryEntity[]`). Hiện
   * endpoint đó trả 501, nên đọc từ bộ nhớ phiên.
   */
  listStandardSets(workspaceSlug: string): Promise<readonly StandardSet[]> {
    return resolveAfterDelay(setsOf(workspaceSlug).map(toSummary));
  },

  /**
   * Tiêu chí của một bộ, đã làm phẳng.
   *
   * Sẽ là `GET /workspaces/:slug/rules/:ruleSetId` (→ `RuleSetEntity` có
   * `sections[]`). Backend gom sẵn theo 5 nhóm CHTK; giao diện tự gom lại theo
   * `category` nên ở đây làm phẳng bằng `sections.flatMap`, đúng như tài liệu
   * ghép nối hướng dẫn.
   */
  listRules(workspaceSlug: string, ruleSetId: string): Promise<readonly Rule[]> {
    const set = setsOf(workspaceSlug).find((item) => item.id === ruleSetId);
    return resolveAfterDelay(set ? set.sections.flatMap((s) => s.rules) : []);
  },

  /** Bộ đầy đủ (kèm `warnings`) đang giữ trong phiên — không gọi mạng. */
  getSessionRuleSet(workspaceSlug: string, ruleSetId: string): RuleSet | undefined {
    return setsOf(workspaceSlug).find((item) => item.id === ruleSetId);
  },

  /**
   * Gửi file Excel lên backend và nhận về các bộ tiêu chuẩn đã đọc được.
   *
   * **Lời gọi mạng thật.** `POST /workspaces/:slug/rules/import`, multipart,
   * trường file tên `file` (conventions §6). `workspaceSlug` nằm ở URL nên
   * không gửi trong form.
   *
   * Trả về **mảng**: mỗi sheet hiển thị trong file là một bộ. File CHTK mẫu có
   * một sheet ("4 SAO") nên mảng một phần tử, nhưng đừng viết code giả định
   * điều đó.
   *
   * Backend hiện trả 200 và **chưa ghi CSDL**, nên kết quả được giữ lại ở
   * `sessionRuleSets` để trang còn hiển thị được.
   */
  async importStandardSet({
    file,
    workspaceSlug,
    signal,
  }: {
    file: File;
    workspaceSlug: string;
    signal?: AbortSignal;
  }): Promise<readonly RuleSet[]> {
    const body = new FormData();
    body.append("file", file, file.name);

    const imported = await apiClient.post<RuleSet[]>(
      `/workspaces/${encodeURIComponent(workspaceSlug)}/rules/import`,
      body,
      { signal },
    );

    sessionRuleSets.set(workspaceSlug, [...imported, ...setsOf(workspaceSlug)]);
    return imported;
  },

  /**
   * Thêm một tiêu chí bằng tay.
   *
   * Sẽ là `POST /{ws}/rules/:ruleSetId/items` — hiện 501, và luồng chính của
   * bộ tiêu chuẩn là nạp Excel chứ không phải nhập tay. Tạm dựng `Rule` ở
   * client để danh sách hiện ra ngay; chưa ghi vào bộ nhớ phiên.
   */
  createRule(ruleSetId: string, input: CreateRuleInput): Promise<Rule> {
    draftSequence += 1;
    const rule: Rule = {
      id: `rule-draft-${Date.now()}-${draftSequence}`,
      ruleSetId,
      code: input.code,
      parentCode: null,
      headings: [],
      title: input.title,
      category: categoryFromRuleIndex(input.code),
      checkType: input.checkType,
      operator: input.operator,
      value: input.value,
      requirement: input.requirement,
      requirementLines: input.requirement
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      houseTypes: input.houseTypes,
      isActive: input.isActive,
      sourceRow: 0,
    };
    return resolveAfterDelay(rule);
  },
};
