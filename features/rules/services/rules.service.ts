import { categoryFromRuleIndex } from "@/shared/constants/domain";
import type { CreateRuleInput, Rule } from "../types/rule.types";

/**
 * Service của feature rules. Trả `Promise` để đúng hình dạng lời gọi API sau
 * này — khi có backend chỉ cần thay phần thân hàm, chữ ký giữ nguyên.
 */

const MOCK_DELAY_MS = 300;

function resolveAfterDelay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let draftSequence = 0;

export const rulesService = {
  /** MOCK — sau này là `POST /rules`, trả về tiêu chí vừa tạo. */
  createRule(input: CreateRuleInput): Promise<Rule> {
    draftSequence += 1;
    const rule: Rule = {
      id: `rule-draft-${Date.now()}-${draftSequence}`,
      category: categoryFromRuleIndex(input.code),
      ...input,
    };
    return resolveAfterDelay(rule);
  },
};
