import { RuleList } from "../components/RuleList";
import { MOCK_RULES } from "../mocks/rules.mock";

export function RuleListContainer() {
  // MOCK — thay bằng hook gọi API khi có backend.
  const rules = MOCK_RULES;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Tiêu chuẩn CHTK
        </h1>
        <p className="text-sm text-text-muted">
          Bộ quy tắc dùng để đối chiếu bản vẽ. Lọc theo nhóm CHTK, loại kiểm tra,
          loại nhà và phép so sánh; tắt công tắc để tạm ngưng áp dụng một quy tắc.
        </p>
      </header>

      <RuleList rules={rules} />
    </section>
  );
}
