# Component Recipes

Công thức chuẩn. Mọi component mới theo đúng khuôn này — không tự nghĩ màu, không tự nghĩ spacing.

Cần cài trước: `npm i clsx tailwind-merge class-variance-authority lucide-react`

## 0. `cn()` — bắt buộc có trước

```ts
// shared/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

## 1. Button — `shared/components/ui/Button.tsx`

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap ' +
    'transition-colors duration-150 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus ' +
    'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-text-on-accent hover:bg-accent-hover',
        secondary: 'bg-surface-raised text-text-primary shadow-ds-border hover:bg-surface-hover',
        ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        danger: 'bg-fail text-text-on-accent hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-sm',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof button>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

## 2. Badge nền — `shared/components/ui/Badge.tsx`

Mọi badge miền (verdict, status, role, review status) đều dựng trên cái này, **luôn có icon + chữ**.

```tsx
import { cn } from '@/shared/lib/cn';

export function Badge({
  icon: Icon,
  children,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {Icon && <Icon className="size-3" aria-hidden />}
      {children}
    </span>
  );
}
```

## 3. Verdict badge — `features/findings/components/`

Verdict = kết luận của máy. Nhãn để trong `finding.constants.ts`.

```tsx
// features/findings/constants/finding.constants.ts
import { CheckIcon, XIcon, AlertTriangleIcon, MinusIcon } from 'lucide-react';

export type Verdict = 'pass' | 'fail' | 'warn' | 'na';

export const VERDICT_CONFIG = {
  pass: { label: 'Đạt',          Icon: CheckIcon,         cls: 'bg-pass-subtle text-pass-text' },
  fail: { label: 'Sai lệch',     Icon: XIcon,             cls: 'bg-fail-subtle text-fail-text' },
  warn: { label: 'Cần kiểm tra', Icon: AlertTriangleIcon, cls: 'bg-warn-subtle text-warn-text' },
  na:   { label: 'Không áp dụng', Icon: MinusIcon,        cls: 'bg-na-subtle text-na-text' },
} as const;
```

```tsx
// features/findings/components/VerdictBadge.tsx
import { Badge } from '@/shared/components/ui/Badge';
import { VERDICT_CONFIG, type Verdict } from '../constants/finding.constants';

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { label, Icon, cls } = VERDICT_CONFIG[verdict];
  return <Badge icon={Icon} className={cls}>{label}</Badge>;
}
```

## 4. FindingStatusBadge — trục khác, không trộn với verdict

```tsx
// features/findings/components/FindingStatusBadge.tsx
import { CircleDotIcon, CheckCircleIcon, CircleSlashIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import type { FindingStatus } from '@/shared/constants/enums';

const CONFIG = {
  open:      { label: 'Đang mở',  Icon: CircleDotIcon,   cls: 'bg-open-subtle text-open-text' },
  resolved:  { label: 'Đã xử lý', Icon: CheckCircleIcon, cls: 'bg-resolved-subtle text-resolved-text' },
  dismissed: { label: 'Bỏ qua',   Icon: CircleSlashIcon, cls: 'bg-dismissed-subtle text-dismissed-text' },
} as const;

export function FindingStatusBadge({ status }: { status: FindingStatus }) {
  const { label, Icon, cls } = CONFIG[status];
  return <Badge icon={Icon} className={cls}>{label}</Badge>;
}
```

## 5. ReasoningGroupTag

```tsx
// features/findings/components/ReasoningGroupTag.tsx
import type { ReasoningGroup } from '@/shared/constants/enums';

const CONFIG: Record<ReasoningGroup, { label: string; dot: string }> = {
  compliance:    { label: 'Tuân thủ',   dot: 'bg-group-compliance' },
  geometry:      { label: 'Hình học',   dot: 'bg-group-geometry' },
  documentation: { label: 'Hồ sơ',      dot: 'bg-group-documentation' },
};

export function ReasoningGroupTag({ group }: { group: ReasoningGroup }) {
  const { label, dot } = CONFIG[group];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}
```

## 6. ConfidenceBadge

Dưới ngưỡng thì đổi amber; trên ngưỡng giữ trung tính để không cạnh tranh với verdict.

```tsx
// features/findings/components/ConfidenceBadge.tsx
import { cn } from '@/shared/lib/cn';

const THRESHOLD = 0.8; // ngưỡng chốt với GVHD, để ở constants khi đã quyết

export function ConfidenceBadge({ value }: { value: number }) {
  const isLow = value < THRESHOLD;
  return (
    <span
      className={cn(
        'numeric text-xs',
        isLow ? 'text-confidence-low' : 'text-confidence-high',
      )}
      title={isLow ? 'Dưới ngưỡng tin cậy — cần người xác nhận' : undefined}
    >
      {(value * 100).toFixed(0)}%
    </span>
  );
}
```

## 7. FindingRow — verdict trước, status sau

```tsx
<button
  onClick={() => selectFinding(finding.id)}
  data-selected={isSelected}
  className="flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left
             transition-colors duration-150
             hover:bg-surface-hover data-[selected=true]:bg-surface-active"
  style={{ borderLeftColor: `var(--group-${finding.group})` }}
>
  <VerdictBadge verdict={finding.verdict} />
  <div className="min-w-0 flex-1">
    <p className="truncate text-sm text-text-primary">{finding.ruleLabel}</p>
    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
      <ReasoningGroupTag group={finding.group} />
      <span>·</span>
      <PageReferenceLink page={finding.page} />
      <span>·</span>
      <ConfidenceBadge value={finding.confidence} />
    </div>
  </div>
  <FindingStatusBadge status={finding.status} />
</button>
```

## 8. Card / KpiCard

```tsx
export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-lg bg-surface-raised p-4 shadow-ds-small', className)} {...props} />;
}
```

```tsx
// features/dashboard/components/KpiCard.tsx
<Card>
  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
  <p className="numeric mt-2 text-2xl font-semibold text-text-primary">{value}</p>
  {delta && <p className="mt-1 text-xs text-text-muted">{delta}</p>}
</Card>
```

## 9. DataTable

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-border-subtle">
      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
        Mã hiệu
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border-subtle transition-colors hover:bg-surface-hover">
      <td className="px-4 py-3 text-text-primary"><span className="numeric">A-01</span></td>
    </tr>
  </tbody>
</table>
```

Cột chứa số/mã hiệu luôn dùng class `.numeric`.

## 10. Input / ThresholdEditor

```tsx
<input
  className={cn(
    'h-9 w-full rounded-md bg-surface-sunken px-3 text-sm text-text-primary',
    'border border-border-default placeholder:text-text-muted',
    'transition-colors duration-150 hover:border-border-strong',
    'focus:border-border-focus focus:outline-none',
    'disabled:opacity-50',
  )}
/>
```

Input nhập số (ngưỡng, kích thước) thêm `numeric text-right`.

## 11. Sidebar item

```tsx
<Link
  href={`/${workspaceSlug}/${path}`}
  data-active={isActive}
  className="rounded-md px-3 py-2 text-sm text-text-secondary transition-colors
             hover:bg-surface-hover hover:text-text-primary
             data-[active=true]:bg-surface-active data-[active=true]:text-text-primary"
>
  {label}
</Link>
```

## 12. EmptyState

```tsx
<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
  <Icon className="size-8 text-text-muted" aria-hidden />
  <div>
    <p className="text-sm font-medium text-text-primary">{title}</p>
    <p className="mt-1 text-xs text-text-muted">{description}</p>
  </div>
  {action}
</div>
```

## 13. Skeleton

```tsx
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-surface-sunken', className)} />;
}
```

## 14. DrawingPageViewer — canvas

```tsx
<div className="relative h-full overflow-auto bg-canvas-backdrop p-6">
  <div className="relative mx-auto bg-canvas-paper shadow-ds-medium">
    {/* ảnh / PDF page */}
    {findings.map((f) => (
      <button
        key={f.id}
        onClick={() => selectFinding(f.id)}
        className="absolute rounded-sm border-2 transition-opacity"
        style={{
          left: `${f.bbox.x}%`, top: `${f.bbox.y}%`,
          width: `${f.bbox.w}%`, height: `${f.bbox.h}%`,
          borderColor: `var(--canvas-annotation-${f.verdict})`,
        }}
        aria-label={`${VERDICT_CONFIG[f.verdict].label}: ${f.ruleLabel}`}
      />
    ))}
  </div>
</div>
```

Canvas không đảo màu theo theme — `--canvas-paper` luôn trắng.

## 15. Overlay

```tsx
// dialog
className="z-[var(--z-modal)] rounded-lg bg-surface-raised p-6 shadow-ds-modal duration-300"
// dropdown / popover
className="z-[var(--z-menu)] rounded-lg bg-surface-raised p-1 shadow-ds-menu duration-200"
```

## Checklist review code UI

- [ ] Không còn class màu mặc định Tailwind (`bg-white`, `border-zinc-200`, `text-gray-*`)
- [ ] Không có `dark:` cho màu
- [ ] Spacing nằm trong thang 4px
- [ ] Verdict và FindingStatus là hai badge riêng, không gộp
- [ ] Kết quả AI luôn kèm confidence và tham chiếu trang
- [ ] Có icon + chữ, không chỉ màu
- [ ] Có `focus-visible`, không `outline: none`
- [ ] Đã xử lý loading / empty / error
- [ ] Số liệu dùng `.numeric`
- [ ] Shadow dùng `shadow-ds-*`
- [ ] `page.tsx` chỉ import container
