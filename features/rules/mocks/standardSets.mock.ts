import type { StandardSet } from "../types/rule.types";

/**
 * MOCK ĐÃ KHÓA — 2026-09-23, khi nối backend thật cho việc nạp Excel.
 *
 * Bộ tiêu chuẩn giờ chỉ sinh ra từ một file Excel người dùng nạp lên
 * (`POST /workspaces/:slug/rules/import`). Một danh sách bộ giả lập sẽ mời
 * người dùng chọn một bộ **không tồn tại trên máy chủ** — chọn xong thì không
 * có tiêu chí nào để hiện.
 *
 * Danh sách thật lấy từ `rulesService.listStandardSets()`; hiện đọc từ bộ nhớ
 * phiên vì `GET /{ws}/rules` còn trả 501 (backend đọc được Excel nhưng chưa
 * lưu CSDL).
 */
export const MOCK_STANDARD_SETS: readonly StandardSet[] = [];

/* ---- Nguyên văn mock cũ, đã khóa ---- */
// export const MOCK_STANDARD_SETS: readonly StandardSet[] = [
//   {
//     id: "std-chtk-4sao-v1",
//     name: "Bộ CHTK 4 sao — bản chuẩn",
//     fileName: "chtk-4-sao-v1.xlsx",
//     ruleCount: 67,
//     uploadedAt: "2026-08-20",
//   },
// ];
