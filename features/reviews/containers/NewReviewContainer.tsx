import { ReviewUploadForm } from "../components/ReviewUploadForm";
import { reviewsService } from "../services/reviews.service";

export async function NewReviewContainer({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const [zoneOptions, standardSets] = await Promise.all([
    reviewsService.listZoneOptions(),
    reviewsService.listStandardSets(),
  ]);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Tạo hồ sơ thẩm định mới
        </h1>
        <p className="text-sm text-text-muted">
          Tải lên bản vẽ PDF, chọn tiêu chuẩn áp dụng và nhóm tiêu chí cần đối
          chiếu.
        </p>
      </header>

      <ReviewUploadForm
        workspaceSlug={workspaceSlug}
        zoneOptions={zoneOptions}
        standardSets={standardSets}
      />
    </section>
  );
}
