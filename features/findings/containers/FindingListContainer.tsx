import { FindingList } from "../components/FindingList";
import { MOCK_DOSSIERS, MOCK_FINDINGS } from "../mocks/findings.mock";

export function FindingListContainer({ workspaceSlug }: { workspaceSlug: string }) {
  // MOCK — thay bằng hook gọi API khi có backend.
  const dossiers = MOCK_DOSSIERS;
  const findings = MOCK_FINDINGS;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Kết quả tiêu chí
        </h1>
        <p className="text-sm text-text-muted">
          Toàn bộ tiêu chí CHTK được đối chiếu, gom theo hồ sơ thẩm định rồi theo
          trạng thái. Chọn một tiêu chí để mở hồ sơ kèm vùng khoanh trên bản vẽ.
        </p>
      </header>

      <FindingList
        dossiers={dossiers}
        findings={findings}
        workspaceSlug={workspaceSlug}
      />
    </section>
  );
}
