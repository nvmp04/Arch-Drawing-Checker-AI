/** Ô số liệu tổng quan: nhãn, số lớn, và một dòng mô tả phạm vi. */
export function KpiCard({
  label,
  value,
  unit,
  valueTone = "text-text-primary",
  description,
  footnote,
}: {
  label: string;
  value: string | number;
  unit?: string;
  valueTone?: string;
  description: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-surface-raised p-4 shadow-ds-small">
      <h3 className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </h3>

      <p className="mt-2 flex items-baseline gap-1">
        <span className={`numeric text-2xl font-semibold ${valueTone}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-text-muted">{unit}</span>}
      </p>

      <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{description}</p>
      {footnote && <p className="mt-1 text-xs text-text-muted">{footnote}</p>}
    </section>
  );
}
