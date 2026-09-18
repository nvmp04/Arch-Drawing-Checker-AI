# Nhật ký quyết định

Vì sao dự án làm theo cách hiện tại. Đọc trước khi định đổi hướng — phần lớn những cách "hiển nhiên hơn" đã được cân nhắc và loại.

Mỗi mục ghi: quyết định · lý do · hệ quả nếu làm ngược lại.

---

## D-01 · Token ba lớp, component chỉ chạm lớp semantic

Primitive `--ds-*` → semantic (`--surface-*`, `--text-*`, `--status-*`) → Tailwind `@theme inline`.

Lý do: đổi theme chỉ cần đổi lớp primitive; component không bao giờ phải viết `dark:`.

Làm ngược lại (hard-code màu, hoặc dùng palette mặc định Tailwind) sẽ khiến theme tối vỡ và không sửa tập trung được.

## D-02 · Không cài thư viện UI khi chưa thật cần

Đã cân nhắc và **cố ý không dùng**: `clsx` + `tailwind-merge` (`cn()`), `class-variance-authority`, `lucide-react`, `zustand`, `next-themes`, `geist`.

Lý do: giai đoạn khung xương, mỗi package là một ràng buộc phải mang theo suốt đồ án. Những gì cần đã tự viết gọn hơn: icon SVG inline trong `shared/components/icons.tsx`, biến thể bằng object config (`STATUS_CONFIG`, `CHECK_TYPE_CONFIG`) thay cho `cva`, nối class bằng template string, state cục bộ bằng `useState`.

Làm ngược lại: thêm `cva` rồi phải viết lại toàn bộ config map đang có; thêm `lucide` thì 25 icon tự viết thành rác.

Khi nào nên cài: `zustand` khi state phải chia sẻ giữa nhiều trang; `next-themes` khi cần đồng bộ theme theo hệ điều hành; `geist` khi chốt font chính thức.

## D-03 · `warning` và `pending` là trạng thái hạng nhất

VLM/OCR không chắc chắn tuyệt đối. Kết quả dưới ngưỡng tin cậy phải nằm ở `warning` hoặc `pending`, không được ép thành `fail`.

Làm ngược lại: người thẩm định mất niềm tin vào hệ thống ngay lần đầu thấy báo sai.

## D-04 · Mức độ và trạng thái là hai trục riêng

Mức độ dùng thang cường độ một sắc (xám → hổ phách → đỏ → đỏ đậm); trạng thái dùng bộ hue riêng. Trên một dòng, hai thứ này nằm hai đầu, không gộp badge.

## D-05 · Trạng thái không bao giờ chỉ bằng màu

Mọi badge trạng thái có **icon + chữ**. Người soát bản vẽ có thể không phân biệt đỏ/xanh. Đây là ràng buộc bắt buộc, không phải tùy chọn.

## D-06 · Canvas bản vẽ luôn nền trắng ở cả hai theme

Bản vẽ kiến trúc là nét đen trên giấy trắng; đảo màu sẽ sai lệch cảm nhận. Token `--canvas-paper` không đổi theo theme.

## D-07 · Trang findings bỏ hẳn bố cục bảng

Thay hàng nhãn cột bằng **khung chú thích khi hover trên từng phần tử**. Mỗi phần tử tự giải thích nó là gì.

Lý do: bảng 9 cột với dữ liệu dài ngắn khác nhau bị lõm và khó đọc; hover tooltip giữ được mật độ mà không mất ngữ nghĩa.

## D-08 · Cây findings ba cấp, mỗi cấp thu gọn được

Hồ sơ thẩm định → nhóm trạng thái → dòng tiêu chí. Mỗi cấp thụt sâu hơn cấp cha; nhóm trạng thái vẽ một đường dọc mang màu trạng thái, nên dòng tiêu chí không tự vẽ viền trái nữa.

Mặc định mở: fail, warning, pending. Mặc định thu gọn: pass, approved, unknown (`COLLAPSED_BY_DEFAULT`). Lý do: người thẩm định vào trang để đọc phần cần xử lý.

Mỗi hồ sơ **luôn liệt kê đủ 6 nhóm trạng thái**, kể cả nhóm rỗng, để người đọc biết đã phủ hết.

## D-09 · Rút gọn khi cột cần thẳng hàng

Loại nhà hiển thị viết tắt (SH, TH, SV, SGV, SHV) trong chip bề rộng cố định; nhóm CHTK dùng tên rút gọn trên dòng dữ liệu dày, tên đầy đủ ở header và menu. Tên đầy đủ luôn có trong tooltip.

Lý do: tên đầy đủ dài ngắn chênh nhau làm bảng lõm.

## D-10 · Nhãn miền gom về `shared/constants/domain.ts`

Cả `features/rules` và `features/findings` đều cần nhãn nhóm CHTK và loại kiểm tra. Feature không được import chéo feature, nên nhãn nằm ở `shared`. `features/findings/constants/finding.constants.ts` chỉ re-export lại cho code cũ khỏi gãy.

## D-11 · `CascadingFilterMenu` không biết gì về miền

Nhóm, giá trị, state đều truyền từ ngoài vào. Nhờ vậy dùng lại được cho findings hoặc reviews sau này. Phần biết về miền nằm ở `features/rules/constants/rule.constants.ts`.

Logic lọc: **AND giữa các nhóm thuộc tính, OR giữa các giá trị trong cùng một nhóm**. Nhóm không chọn gì thì không ràng buộc.

## D-12 · Mock chỉ một hồ sơ thẩm định

Bộ tiêu chí rất dài, nên mock nhiều hồ sơ chỉ làm loãng. Một hồ sơ chứa đủ 66 finding phủ hết 6 trạng thái là đủ để dựng và kiểm thử giao diện.

## D-13 · Dashboard được phép đọc dữ liệu của feature khác

Luật chung là feature không import feature. Dashboard là ngoại lệ có chủ đích: theo định nghĩa nó là trang tổng hợp, phải đọc findings + reviews + rules.

Giới hạn của ngoại lệ: chỉ được import **type, mock và component presentational**; **không** import container, hook hay store của feature khác. Toàn bộ phần tổng hợp gom trong `features/dashboard/services/dashboard.service.ts`, đúng hình dạng API tương lai — khi có backend thì bỏ hết import chéo, chỉ còn một lời gọi trả về `DashboardSummary`.

## D-14 · Màu "Đã duyệt" là tím, không phải teal

Chạy validator của skill dataviz trên bộ 6 màu trạng thái ở nền tối: `pass` (green-700) ↔ `approved` (teal-700) chỉ cách nhau ΔE **8.3** ở mắt thường — dưới ngưỡng 15, nghĩa là ngay cả người nhìn màu bình thường cũng khó tách hai đoạn nằm cạnh nhau trên thanh stacked. Cặp `approved` ↔ `unknown` ΔE 1.3 ở mắt deutan.

Đổi sang purple-700 thì cả ba phép kiểm về tách màu đều PASS.

Hệ quả cần biết: tím giờ xuất hiện ở hai thang khác nhau — trạng thái "Đã duyệt" và phân loại (`--group-a`, `--cat-structure`). Chấp nhận được vì **màu chỉ mang nghĩa trong phạm vi một thang**, và thang trạng thái luôn kèm icon + chữ, còn thang phân loại chỉ là chấm nhỏ trong chip trung tính.

Còn hai cảnh báo không sửa: amber-700 nằm ngoài dải sáng chuẩn và gray không có sắc độ. Đây là đặc tính của thang trạng thái chứ không phải thang phân loại; bù bằng icon + nhãn chữ + hàng chú thích có số lượng.

## D-15 · Thanh stacked luôn có khe 2px và hàng chú thích

Các đoạn cạnh nhau phải cách nhau 2px nền, và mọi thanh phân rã phải đi kèm hàng chú thích liệt kê đủ 6 trạng thái với số lượng. Không bao giờ để màu đứng một mình.

## D-16 · Bỏ Topbar/WorkspaceSwitcher, cài `pdfjs-dist` để render PDF thật

Topbar chỉ chứa `WorkspaceSwitcher` (rỗng) và một đường kẻ `border-b` — không mang chức năng thật, chỉ chiếm 64px + một đường phân cách phía trên vùng làm việc chính. Đã bỏ hẳn khỏi `app/[slug]/layout.tsx`; `Sidebar` giờ đứng cạnh `main` trực tiếp. Xóa luôn `Topbar.tsx` và `WorkspaceSwitcher.tsx` — không còn nơi nào import.

Khung xem bản vẽ ở `/[slug]/reviews/[reviewId]` cần render PDF thật (Deep Zoom / Map Viewport Pattern), không dùng placeholder SVG. Đã cân nhắc lại D-02 và quyết định cài `pdfjs-dist` — đây là thư viện xử lý định dạng file (PDF), khác bản chất với `clsx`/`cva`/`lucide-react` (những thứ có thể tự viết gọn hơn); không có cách hợp lý nào để tự viết một trình đọc PDF.

Hệ quả kỹ thuật:

- Worker script (`pdf.worker.min.mjs`) copy tĩnh vào `public/` bởi `scripts/copy-pdf-worker.mjs`, chạy tự động qua npm script `postinstall`. Không commit file này (gắn với đúng bản `pdfjs-dist` đã cài) — thêm vào `.gitignore`.
- `eslint.config.mjs` phải `globalIgnores(["public/**"])`, nếu không ESLint sẽ lint luôn file worker đã minify (hàng nghìn cảnh báo vô nghĩa + 1 lỗi `no-this-alias` thật).
- Chưa có backend lưu file PDF thật đã tải lên theo từng hồ sơ, nên mọi hồ sơ tạm dùng chung một file: `public/mock/PN2-DN-01.pdf` (bản vẽ mẫu thật, 48 trang, ~20MB). `scripts/generate-sample-pdf.mjs` (viết tay, không phụ thuộc thư viện, chỉ chạy lúc dựng dữ liệu) vẫn giữ lại làm phương án dự phòng khi không có file mẫu thật — sinh vài hình chữ nhật/đường kẻ mô phỏng mặt bằng, đủ để test pan/zoom.
- `pdfjsLib` phải `import("pdfjs-dist")` **động bên trong `useEffect`**, không import tĩnh ở đầu file — bản build trình duyệt của pdf.js chạm vào API chỉ có ở client ngay lúc nạp module, import tĩnh trong một "use client" component vẫn bị Next SSR nếu component đó không tách nhánh chỉ-client.

## D-17 · Trang review-detail được đọc type/mock/component presentational của `findings` — không tái dùng container/hook có sẵn

`/[slug]/reviews/[reviewId]` phải hiển thị đồng thời bản vẽ của một Review VÀ các Finding của nó — giống lý do D-13 cho phép dashboard đọc chéo. Áp dụng đúng giới hạn của D-13: `features/reviews` được import **type, mock và component presentational** của `features/findings` (badge trạng thái, mức độ, độ tin cậy, tag nhóm/CHTK, page reference) để dựng `FindingResultCard`; **không** import container hay hook của findings.

Vì giới hạn này, `features/findings/containers/FindingDetailPanelContainer.tsx` và `features/findings/hooks/useFindingVerdictMutation.ts` (đã có sẵn từ scaffold, tên gọi rất khớp với tính năng "khung kết quả thẩm định") **cố tình để lại chưa dùng** — nếu dùng thì `reviews` phải import container/hook chéo feature, phá giới hạn D-13. Thay vào đó, toàn bộ state (finding đang chọn, xác nhận, ghi chú) giữ trong `ReviewWorkspace` (reviews feature) bằng object override cục bộ, giống mẫu `overrides` đã dùng ở `RuleList`.

Nếu sau này có backend và muốn dọn lại theo đúng tên hai file scaffold trên, cần cân nhắc chuyển toàn bộ cụm viewer + panel này sang sở hữu bởi `features/findings` thay vì `features/reviews`.

## D-18 · Nút "Xác nhận" chuyển finding sang `approved`, không phải `pass`

Chuyên gia xác nhận kết luận của máy → đúng định nghĩa sẵn có của `approved` ("người thẩm định đã xác nhận kết luận của máy"), khác với `pass` ("máy tự kết luận đạt"). Giữ được phân biệt đã đầu tư ở D-14 (màu tím riêng, ΔE đã kiểm). Nút chỉ hiện khi `finding.status !== "approved"`.

---

# Bẫy đã gặp — đừng lặp lại

## T-01 · Tham chiếu vòng trong `@theme inline`

Khai `--radius-md` ở `:root` rồi lại map `--radius-md: var(--radius-md)` trong `@theme inline` tạo vòng lặp, Tailwind không sinh ra `rounded-md`.

Cách xử lý đang dùng: giá trị không đổi theo theme thì **ghi thẳng số** trong `@theme`; biến gốc của motion đặt tên `--motion-ease-*` để không đụng namespace `--ease-*` mà Tailwind giữ riêng.

## T-02 · `overflow-hidden` cắt mất tooltip

Card bọc ngoài dùng `overflow-hidden` để bo góc sẽ cắt khung chú thích của dòng đầu tiên, vì tooltip nằm phía trên phần tử.

Cách xử lý: bỏ `overflow-hidden`, bo góc trực tiếp trên header (`rounded-t-lg`, thêm `rounded-b-lg` khi thu gọn).

## T-03 · Sửa props của container phải rà hết mọi route gọi nó

Thêm prop `workspaceSlug` cho `FindingListContainer` làm gãy `npm run build` ở `/[slug]/zones/[zoneId]/findings` — nhánh zone có page riêng gọi cùng container.

Trước khi coi là xong: chạy `npm run build`, nó chạy type check trên **toàn bộ** file trong `tsconfig.include`, kể cả file không ai import.

## T-04 · File chết vẫn làm gãy build

`DrawingGroupSection.tsx` không còn ai import nhưng vẫn tham chiếu type đã xóa → build đỏ. File nào bỏ thì xóa hẳn, đừng để lại.

## T-05 · Không được đặt phần tử focus được bên trong `<Link>`

Tooltip trong dòng findings ban đầu có `tabIndex={0}` nằm trong thẻ `<a>` — hỏng điều hướng bàn phím. Nay tooltip chỉ hover, thông tin thiết yếu nằm trong `aria-label` của cả dòng.

## T-06 · Đừng tin mắt khi chọn màu cho biểu đồ

Bộ 6 màu trạng thái nhìn bằng mắt thì "khác nhau rõ", nhưng validator chỉ ra hai cặp gần như trùng. Có biểu đồ mới thì chạy lại:

```bash
node scripts/validate_palette.js "<hex,hex,...>" --mode dark --surface "#0a0a0a"
```

## T-07 · `p-*` và `pl-*`/`pt-*`... trên cùng một phần tử — class nào đứng sau trong stylesheet của Tailwind thắng, không phải class nào viết sau trong JSX

Từng gộp `pl-64 p-6` trên cùng một `<main>` để giảm một lớp div — `p-6` (cùng set `padding-left`) đè mất `pl-64`, nội dung dính sát Sidebar. Hai class cùng set một thuộc tính thì phải tách ra hai phần tử (wrapper chỉ `pl-64`, `main` bên trong chỉ `p-6`), không gộp chung dù trông "chỉ là spacing".

## T-08 · Asset tĩnh trong `public/` bị ESLint quét nếu không loại trừ

Copy `pdf.worker.min.mjs` (bản build đã minify của `pdfjs-dist`) vào `public/` làm `npm run lint` ra hàng nghìn cảnh báo vô nghĩa (đọc nhầm code đã minify) cộng một lỗi thật (`no-this-alias`). Phải thêm `public/**` vào `globalIgnores` trong `eslint.config.mjs`. Bất kỳ asset build/generated nào copy vào `public/` đều cần soát lại danh sách ignore này.

## T-09 · React đăng ký `onWheel`/`onTouchMove` ở root với `passive: true` — `preventDefault()` trong handler JSX không chặn được scroll/zoom mặc định của trình duyệt

Khung xem bản vẽ cần `event.preventDefault()` khi lăn chuột để zoom mà không cuộn trang. Gắn qua `onWheel` của React không đủ — phải dùng `element.addEventListener("wheel", handler, { passive: false })` thủ công trong `useEffect`, gỡ khi unmount.

## T-10 · Đọc lại `ref.current` bên trong updater của `setState` có thể đã bị đổi bởi event khác

`onPointerMove` của khung xem bản vẽ ban đầu đọc `dragRef.current!.originX` **bên trong** callback truyền cho `setTransform` — nếu `pointerup` (set `dragRef.current = null`) xảy ra trước khi React thực thi callback đó, ứng dụng crash vì đọc thuộc tính trên `null`. Sửa bằng cách chụp giá trị ref vào một biến cục bộ (`const drag = dragRef.current; if (!drag) return;`) **trước** khi gọi `setState`, rồi dùng biến đó trong callback — không đọc lại `.current` bên trong.

## T-11 · Giới hạn zoom phải tính theo tỉ lệ so với mức "vừa khung", không phải giá trị scale tuyệt đối

Đặt cứng `VIEWER_MIN_SCALE = 0.5` (giá trị scale tuyệt đối) khiến nút thu nhỏ không hoạt động: vì canvas render ở độ phân giải oversample (`RENDER_SCALE = 2.25`), scale "vừa khung" tính ra thường **thấp hơn** 0.5 với trang khổ lớn — làm hàm tính "vừa khung" bị chặn ở đúng ngưỡng tối thiểu, khiến % zoom hiển thị luôn là 100% dù đã bấm thu nhỏ. Sửa bằng cách: hàm tính "vừa khung"/"zoom vào vùng" chỉ chặn theo ngưỡng an toàn rất rộng (chống NaN/Infinity), còn giới hạn zoom cho thao tác của người dùng (lăn chuột, nút +/-) tính **tương đối theo `fitScale` hiện tại** (`VIEWER_MIN_ZOOM_RATIO`, `VIEWER_MAX_ZOOM_RATIO` trong `review.constants.ts`).

## D-19 · Cài `pdf-lib` để xuất PDF đánh dấu

Nút "Tải PDF đánh dấu" ở trang review-detail cần ghi vùng khoanh + chỉ mục vào file PDF gốc — không có cách hợp lý để tự viết trình ghi PDF (khác với D-02). `features/reviews/services/annotatedPdf.service.ts` fetch PDF gốc, vẽ hình chữ nhật viền theo màu trạng thái + nhãn chỉ mục ở góc trên-trái từng khối, rồi tải xuống. Màu đọc từ token CSS `--status-*` lúc chạy (`readStatusColors`) nên không hard-code bộ màu thứ hai. Toạ độ `boundingBox` (% trang đang hiển thị) được quy đổi ngược theo `/Rotate` của trang. Chạy hoàn toàn ở client; khi có backend thì thay bằng một endpoint trả file. Đã kiểm bằng Node trên file thật (48 trang, ~0.8s).

## D-20 · Khối khoanh vùng giữ kích thước cố định trên màn hình

Khối nằm trong vùng bị `scale`, nên viền và nhãn chỉ mục chia ngược cho `transform.scale` (`borderWidth = px / scale`, nhãn `scale(1/scale)`) để luôn 2px / 12px trên màn hình ở mọi mức zoom. Nhãn nền `--canvas-paper`, chữ `--canvas-ink` (token mới, cố định như canvas), viền theo màu trạng thái.

## T-12 · Đừng bọc phần tử `absolute` trong `Tooltip`

`Tooltip` là `span.relative` không có kích thước — bọc khối khoanh (`absolute`, `left/top/width/height` theo %) trong đó làm % tính theo span 0×0 nên khối không hiện đúng chỗ. Khối khoanh dùng `title` gốc thay cho Tooltip.

## D-21 · Khung xem bản vẽ render lại theo mức zoom (lớp chi tiết), không kéo giãn bitmap

Render trang một lần rồi CSS-scale làm nét vỡ khi zoom sâu — bitmap chỉ có `RENDER_SCALE` px/pt. Nay `DrawingPageViewer` có hai lớp canvas: **lớp nền** (cả trang, `RENDER_SCALE = 1.5`, hiện tức thì khi đang thao tác) và **lớp chi tiết** — sau khi dừng zoom/kéo ~140ms, pdf.js render lại **chỉ vùng khung xem** ở đúng mức zoom × `devicePixelRatio` (≤ 2) qua `getViewport({ scale, offsetX, offsetY })` + `background` trong suốt, vào canvas offscreen rồi mới `drawImage` sang canvas hiển thị (tránh nhấp nháy khi render dở). Lớp chi tiết nằm giữa lớp nền và lớp vùng khoanh; giữa hai lần render nó được dịch/co giãn theo phần chênh transform và chỉ hiện khi còn nét hơn lớp nền. Nó tô giấy trắng đúng vùng trang để che nét mờ của lớp nền bên dưới. Kích thước canvas nền dùng số thực (không làm tròn) để khớp tuyệt đối với vùng khoanh tính theo %. Đã kiểm bằng Node (`@napi-rs/canvas`) trên file thật: vector/chữ sắc ở 4x và 24x. Chưa xem bằng mắt trong trình duyệt.

## T-13 · Tàn ảnh khi đổi lớp chi tiết — đừng `drawImage` vào canvas đang hiện rồi mới `setState`

Bản đầu vẽ xong vào canvas offscreen, `drawImage` sang canvas đang hiện, **rồi** mới `setDetail` (transform mới). Giữa hai bước là ít nhất một khung hình nội dung mới nằm sai vị trí so với transform cũ → tàn ảnh. Sửa bằng double buffer: hai canvas luân phiên, vẽ thẳng vào cái đang ẩn; xong mới `setDetail({ slot })` — hiện/ẩn và transform đổi cùng một lần commit. Thêm overscan 15% mỗi phía để kéo nhẹ không lộ mép lớp nền mờ.
