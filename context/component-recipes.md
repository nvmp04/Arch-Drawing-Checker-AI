# Component Recipes

Khuôn mẫu **lấy từ code đang chạy trong repo**, không phải đề xuất. Component mới theo đúng khuôn này.

Dự án **không dùng** `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react` — xem `decisions.md` D-02. Đừng viết recipe dựa trên chúng.

## 0. Nối class có điều kiện

Không có `cn()`. Dùng template string, và ưu tiên `data-*` + biến thể Tailwind cho trạng thái:

```tsx
<button
  data-active={isActive}
  className={`rounded-md px-3 py-2 text-sm text-text-secondary transition-colors duration-150
              hover:bg-surface-hover hover:text-text-primary
              data-[active=true]:bg-surface-active data-[active=true]:text-text-primary
              ${className ?? ""}`}
/>
```

Cách này tránh phải merge class và đọc thẳng được trạng thái trong DOM khi test.

## 1. Biến thể bằng object config, không dùng `cva`

Mỗi enum miền có một config map đặt trong `constants`, chứa sẵn nhãn, icon và class:

```ts
export const STATUS_CONFIG: Record<FindingStatus, {
  label: string; Icon: IconComponent; badge: string; bar: string; border: string;
}> = {
  fail: {
    label: "Không đạt",
    Icon: XIcon,
    badge: "bg-fail-subtle text-fail-text",
    bar: "bg-fail",
    border: "border-l-fail",
  },
  // ...
};
```

Component chỉ tra map rồi ghép:

```tsx
const { label, Icon, badge } = STATUS_CONFIG[status];
return (
  <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${badge}`}>
    <Icon className="size-3 shrink-0" />
    {label}
  </span>
);
```

**Luật:** class Tailwind phải là chuỗi tĩnh trong config, không ghép động kiểu `bg-${status}` — Tailwind không quét ra được.

## 2. Icon — `shared/components/icons.tsx`

SVG inline, stroke 1.5, viewBox 24, mặc định `size-4`. Thêm icon mới thì thêm vào file này theo đúng khuôn `Svg`, đặt tên trùng tên lucide tương ứng.

```tsx
export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}
```

Kiểu dùng cho props nhận icon: `(props: { className?: string }) => React.ReactElement`.

## 3. Tooltip — `shared/components/Tooltip.tsx`

Khung chú thích hover, thay cho hàng nhãn cột.

```tsx
<Tooltip
  align="right"
  content={
    <>
      <TipTitle>Trạng thái — {label}</TipTitle>
      <TipText>{STATUS_DESCRIPTION[status]}</TipText>
      <TipMeta>Độ tin cậy kỳ vọng: <span className="numeric">85–95%</span></TipMeta>
    </>
  }
>
  <span>{children}</span>
</Tooltip>
```

Lưu ý:

- tooltip nằm **phía trên** phần tử → card bọc ngoài không được `overflow-hidden` (bẫy T-02)
- phần tử kích hoạt **không được focus được** khi nằm trong `<Link>` (bẫy T-05); thông tin thiết yếu phải có trong `aria-label` của dòng
- `align="right"` cho phần tử nằm sát mép phải

## 4. Switch — `shared/components/Switch.tsx`

```tsx
<Switch checked={isActive} onChange={setActive} label={`Áp dụng tiêu chí ${code}`} />
```

`role="switch"` + `aria-checked`, nhãn bắt buộc.

## 5. Menu popover (menu thao tác, dropdown)

Khuôn ở `features/rules/components/RuleActionMenu.tsx`. Ba thứ bắt buộc:

```tsx
const rootRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (!isOpen) return;
  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
  };
  const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
  document.addEventListener("mousedown", onPointerDown);
  document.addEventListener("touchstart", onPointerDown);
  document.addEventListener("keydown", onKeyDown);
  return () => { /* gỡ cả ba */ };
}, [isOpen]);
```

Panel: `absolute z-[var(--z-menu)] rounded-lg bg-surface-raised p-1 shadow-ds-menu`.

## 6. Nhóm thu gọn được

Khuôn ở `features/findings/components/{ReviewDossierSection,StatusGroupSection}.tsx`.

```tsx
<button aria-expanded={isOpen} aria-controls={panelId} onClick={onToggle}>
  <ChevronDownIcon className={`size-4 transition-transform duration-150 ${isOpen ? "" : "-rotate-90"}`} />
  ...
</button>
{isOpen && <div id={panelId}>...</div>}
```

State đóng/mở giữ ở component cha dạng `Set` các khóa **đang đóng** (mặc định là mở), để thêm phần tử mới không phải khởi tạo lại.

## 7. Dòng dữ liệu — không dùng bảng

`flex flex-wrap items-center gap-x-3 gap-y-2`, phần tử co giãn dùng `min-w-0 flex-1 basis-40`, cụm bên phải gom trong một `<span className="ml-auto flex items-center gap-3">`.

Cột cần thẳng hàng thì cho bề rộng cố định (`w-14`, `w-32`) thay vì để nội dung tự quyết.

## 8. Trang danh sách

```
containers/XxxListContainer.tsx   (server) — lấy mock/API, render header + <XxxList />
components/XxxList.tsx            ("use client") — state lọc, gom nhóm, sắp xếp
components/XxxRow.tsx             — một dòng, nhận props, không gọi API
```

`page.tsx` chỉ import container. Container nào cần `workspaceSlug` thì **mọi route gọi nó** phải truyền (bẫy T-03).

## 9. Trạng thái rỗng

```tsx
<div className="rounded-lg bg-surface-raised px-4 py-10 text-center shadow-ds-small">
  <EmptyState message="Không có tiêu chí nào khớp bộ lọc." />
</div>
```

## 10. Số liệu

Mọi con số so sánh theo cột dùng class `.numeric` (mono + `tabular-nums`, khai trong `globals.css`).

## Checklist review code UI

- [ ] Không còn class màu mặc định Tailwind (`bg-white`, `border-zinc-200`, `text-gray-*`)
- [ ] Không có `dark:` cho màu
- [ ] Class Tailwind là chuỗi tĩnh, không ghép động
- [ ] Spacing nằm trong thang 4px
- [ ] Trạng thái có icon + chữ, không chỉ màu
- [ ] Có `focus-visible`, không `outline: none`
- [ ] Popover có click-outside + Escape
- [ ] Card chứa tooltip không dùng `overflow-hidden`
- [ ] Số liệu dùng `.numeric`
- [ ] Shadow dùng `shadow-ds-*`
- [ ] `page.tsx` chỉ import container
- [ ] `npm run build` sạch
