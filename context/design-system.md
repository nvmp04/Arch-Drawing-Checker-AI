# Design System — Arch Drawing Checker AI

Nền tảng: **Geist Design System (Vercel)**. File này là nguyên lý; giá trị thô nằm ở `app/globals.css`.

## 1. Kiến trúc token — 3 lớp

| Lớp | Ví dụ | Ai được dùng |
|---|---|---|
| Primitive | `--ds-gray-300`, `--ds-blue-700` | Chỉ `globals.css` khi định nghĩa lớp semantic |
| Semantic | `--surface-raised`, `--text-muted`, `--status-fail` | **Component dùng lớp này** |
| Tailwind | `bg-surface-raised`, `text-muted`, `border-border-default` | JSX |

**Luật cứng:**

1. Không hard-code màu trong component (`#fff`, `rgb()`, `bg-gray-500` của Tailwind mặc định) — luôn đi qua token.
2. Ưu tiên semantic. Chỉ dùng `bg-ds-*` khi thật sự không có semantic phù hợp; nếu lặp lại 2 lần trở lên thì thêm semantic token mới vào `globals.css`.
3. Không viết `dark:` cho màu. Token đã tự đổi theo theme. `dark:` chỉ dành cho trường hợp đặc biệt về ảnh/opacity.

## 2. Thang màu

Chạy **100 (nhạt nhất) → 1000 (đậm nhất)** với ý nghĩa bậc giống nhau ở cả 2 theme:

- 100–300: nền tint, nền badge, hover nhẹ
- 400–600: viền, divider, icon phụ
- 700–800: màu đặc của trạng thái/accent, chữ trên nền tint
- 900–1000: chữ tương phản cao

Bậc 700 của mọi màu **giống hệt nhau ở light và dark** — đó là màu "thương hiệu" của trạng thái, dùng cho fill đặc và icon.

## 3. Bảng ngữ nghĩa cho miền bài toán

Tất cả bám theo enum thật trong `shared/constants/enums.ts`, `features/findings/types`, `features/reviews/types`. Thêm enum mới ở đó thì phải thêm token tương ứng ở đây.

### 3.1 Verdict — kết luận của một lần kiểm tra

Đây là **trục màu chính** của app (feed vào `PassRateByGroupChart`, `ConclusionByCheckTypeChart`).

| Verdict | Token | Màu | Nhãn hiển thị |
|---|---|---|---|
| pass | `--verdict-pass` | green-700 | Đạt |
| fail | `--verdict-fail` | red-700 | Sai lệch |
| warn | `--verdict-warn` | amber-700 | Cần kiểm tra |
| na | `--verdict-na` | gray-700 | Không áp dụng |

Mỗi verdict có bộ 3: `--verdict-X` (fill đặc, icon), `--verdict-X-subtle` (nền badge), `--verdict-X-text` (chữ trên nền subtle). Tailwind: `bg-pass-subtle text-pass-text`, `bg-fail`, ...

> Vì VLM/OCR không chắc chắn tuyệt đối, **warn là verdict hạng nhất**, không phải biến thể phụ của fail. Kết quả dưới ngưỡng tin cậy luôn là `warn` kèm số confidence, không được ép thành `fail`.

### 3.2 FindingStatus — trạng thái xử lý (trục riêng, KHÔNG trộn với verdict)

`open | resolved | dismissed`

| Status | Token | Màu |
|---|---|---|
| open | `--finding-open` | blue-700 |
| resolved | `--finding-resolved` | green-700 |
| dismissed | `--finding-dismissed` | gray-700 |

Một finding có **hai thuộc tính độc lập**: máy kết luận gì (verdict) và người đã xử lý tới đâu (status). Trên UI không được gộp thành một badge. Quy ước: badge verdict đứng trước (trái), badge status đứng sau hoặc ở cột riêng.

### 3.3 ReviewStatus / ProcessingState

`draft | processing | completed` và `idle | running | failed`

`--review-draft` gray · `--review-processing` blue · `--review-completed` green · `--review-failed` red.

### 3.4 ReasoningGroup

`compliance | geometry | documentation`

| Nhóm | Token | Màu |
|---|---|---|
| compliance | `--group-compliance` | purple-700 |
| geometry | `--group-geometry` | teal-700 |
| documentation | `--group-documentation` | pink-700 |

Màu nhóm chỉ để **phân loại** (chấm tròn, viền trái, tag) — không bao giờ báo đúng/sai.

### 3.5 Confidence

`--confidence-high` (gray-700, trung tính) và `--confidence-low` (amber-700).

Confidence cố tình **không dùng thang xanh–đỏ** để không cạnh tranh thị giác với verdict. Chỉ khi dưới ngưỡng mới đổi màu sang amber — trùng với màu của verdict `warn`, vì hai thứ này luôn đi cùng nhau.

### Canvas xem bản vẽ

`--canvas-paper` luôn trắng ở cả hai theme: bản vẽ kiến trúc là nét đen trên giấy trắng, đảo màu sẽ sai lệch cảm nhận. Nền quanh canvas dùng `--canvas-backdrop`. Annotation vẽ đè lên canvas dùng `--canvas-annotation-*` (bậc 700, tương phản tốt trên trắng).

## 4. Nền & phân tầng (elevation)

Geist tạo chiều sâu bằng **hai lớp nền + viền hairline 1px**, không bằng shadow dày.

- Nền trang: `--surface-page`
- Card / panel / sidebar: `--surface-raised` + `border-border-default`
- Input, code block, track: `--surface-sunken`
- Hover item: `--surface-hover`; item đang chọn: `--surface-active`

Shadow luôn đi kèm viền — dùng utility `shadow-ds-small` (đã gộp sẵn `--ds-shadow-border-base`), không dùng `shadow-md` mặc định của Tailwind.

| Utility | Dùng cho |
|---|---|
| `shadow-ds-small` | card thường |
| `shadow-ds-medium` | card có hover nổi lên |
| `shadow-ds-menu` | dropdown, popover |
| `shadow-ds-modal` | dialog, drawer |

## 5. Typography

Font: **Geist Sans** (body/heading), **Geist Mono** (số liệu, mã hiệu bản vẽ, tọa độ, timestamp, JSON output).

- Cỡ nền của app là **14px** (`text-sm`), không phải 16px — đây là app dashboard.
- Weight: 400 body, 500 nhấn nhẹ, 600 heading. **Không dùng 700+.**
- Heading lớn: `tracking-tight` (-0.025em). Label cột bảng viết hoa nhỏ: `tracking-wide` + `text-xs` + `text-muted`.
- Mọi con số so sánh theo cột (kích thước, cao độ, số hiệu) phải dùng class `.numeric` (mono + `tabular-nums`) để căn thẳng chữ số.

| Token | Size | Dùng cho |
|---|---|---|
| `text-xs` | 12px | label, caption, metadata |
| `text-sm` | 14px | body mặc định, bảng, form |
| `text-base` | 16px | tiêu đề card, nội dung nhấn |
| `text-lg` | 18px | tiêu đề section |
| `text-xl` | 20px | tiêu đề trang |
| `text-2xl`+ | 24px+ | chỉ dùng ở landing / số liệu tổng lớn |

## 6. Spacing — thang 4px

`4 / 8 / 12 / 16 / 24 / 32 / 40 / 64` (Tailwind: `1 / 2 / 3 / 4 / 6 / 8 / 10 / 16`).

- Padding trong component nhỏ (button, badge): 8–12px
- Padding card: 16px (dày) hoặc 12px (chặt, trong danh sách)
- **Khoảng cách giữa các block/card: 24px** — con số mặc định, dùng `gap-6`
- Padding lề trang: 24px

Không dùng giá trị lẻ ngoài thang (không `p-[13px]`).

## 7. Border radius

| Utility | Value | Dùng cho |
|---|---|---|
| `rounded-sm` | 4px | badge, tag nhỏ |
| `rounded-md` | 6px | **mặc định** — button, input, card nhỏ |
| `rounded-lg` | 8px | card lớn, modal |
| `rounded-xl` | 12px | panel lớn, popover |

## 8. Motion

- Transition mặc định: `duration-150` + `ease-standard` (utility do `@theme` sinh ra) cho hover màu/viền.
- Biến gốc trong `:root` đặt tên `--motion-ease-standard` / `--motion-ease-swift` để không đụng namespace `--ease-*` mà Tailwind dành riêng; đừng đổi lại thành `--ease-*`, sẽ tạo tham chiếu vòng.
- Popover/dropdown: 0.2s. Modal/drawer: 0.3s, có thể dùng `--ease-swift` cho cảm giác nảy nhẹ.
- Không animate `width`/`height` của panel lớn khi đang render canvas bản vẽ — dùng `transform`.
- Tôn trọng `prefers-reduced-motion`.

## 9. Z-index

`drawer 200 < modal 300 < menu 2001 < toast 5000 < tooltip 99999`. Không viết z-index rời rạc trong component; dùng token.

## 10. Accessibility tối thiểu

- Không bao giờ dùng **chỉ màu** để truyền trạng thái: mỗi status luôn có icon + nhãn chữ. Người kiểm tra bản vẽ có thể mù màu đỏ/xanh — đây là ràng buộc bắt buộc, không phải tùy chọn.
- Focus ring: `--border-focus`, outline 2px offset 2px, không được `outline: none`.
- Chữ trên nền `--verdict-X-subtle` phải dùng `--verdict-X-text` (bậc 900), không dùng bậc 700.
