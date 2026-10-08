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

## D-22 · Cài TanStack Query làm lớp dữ liệu cho cả dự án

`@tanstack/react-query` v5 (dep) + `@tanstack/react-query-devtools` (devDep).

Đây là lần cân nhắc lại D-02 thứ ba, và thuộc cùng loại với `pdfjs-dist`/`pdf-lib`: thứ **không có cách hợp lý để tự viết gọn hơn**. Cache theo khóa, chống gọi trùng, khử trạng thái cũ, `invalidate` sau khi ghi, retry có phân biệt loại lỗi — tự viết ra sẽ là một thư viện nửa vời, và nó là nền cho toàn bộ phần nối backend ở giai đoạn 2.

Cấu hình đặt ở `shared/services/queryClient.ts`, các mốc đáng chú ý:

- `staleTime: 60s` chứ không phải 0. Có SSR thì `staleTime: 0` khiến client refetch ngay lần hydrate đầu, tải hai lần cho một lần xem.
- `refetchOnWindowFocus: false`. Người thẩm định liên tục rời tab đi đọc tiêu chuẩn rồi quay lại; tự refetch làm danh sách nhảy dưới tay họ.
- `retry` đọc `ApiError.isRetryable` — lỗi 4xx thử lại vẫn 4xx.
- `getQueryClient()` tạo mới trên server, giữ một bản trên trình duyệt. **Không** được tạo `new QueryClient()` ở module scope: trên server module dùng chung giữa request của mọi người dùng, sẽ rò dữ liệu người này sang người kia.

Khóa cache nằm ở `features/<feature>/constants/<feature>.queryKeys.ts`, đi từ rộng tới hẹp (`["reviews"]` → `["reviews","list",slug]`) để `invalidateQueries` dọn được theo tầng. Không viết mảng khóa thẳng trong hook — gõ nhầm một chữ là cache tách đôi mà không có lỗi nào báo.

## D-23 · Container thành Client Component, `page.tsx` vẫn là Server Component

Trước D-22, một số container là `async` Server Component gọi thẳng service (`ReviewListContainer`, `NewReviewContainer`, `ReviewDetailContainer`), số còn lại import thẳng `MOCK_*`. Nay **cả sáu container đều `"use client"`** và lấy dữ liệu qua hook của feature.

Lý do chọn cách này thay vì server prefetch + `HydrationBoundary`: cách kia buộc mỗi trang phải viết hai lớp (server prefetch + client hook) cho cùng một query, trong khi cái dự án đang thiếu là **trạng thái loading/error thật** (`ui-conventions.md` §7 ghi nợ từ đầu). Container client có đủ bốn nhánh loading / error / empty / data trong một chỗ đọc được.

`page.tsx` **không** đổi: vẫn là Server Component, vẫn `await params`, vẫn chỉ import container. Ranh giới client bắt đầu ở container.

Hệ quả cần biết: HTML server trả về là **khung chờ**, không phải dữ liệu. Không SEO được nội dung danh sách — chấp nhận được vì đây là app nội bộ sau đăng nhập. Khi nào cần SSR nội dung thật thì thêm prefetch + `HydrationBoundary` ở `page.tsx`, hook không phải sửa.

Kéo theo: `RuleListContainer` nhận thêm prop `workspaceSlug` (cần cho `queryKey`), nên hai route `/[slug]/rules` và `/[slug]/zones/[zoneId]/rules` đều phải truyền — đúng bẫy T-03.

## D-24 · `shared/utils/` — tầng thứ năm của `shared`

Thêm `shared/utils/{number,format,storage,async}.ts`, gom những hàm thuần không phải hook, không phải service, không biết miền bài toán.

Vì sao cần: `clamp` viết cục bộ trong `DrawingPageViewer`, công thức `Math.round((a/b)*100)` chép ở bốn chỗ (dashboard ×2, `FindingResultPanel`, `ReviewListItem`), `resolveAfterDelay` chép ở hai service, và mỗi nơi đọc Web Storage tự bọc `try/catch` + guard SSR một kiểu khác nhau.

`percentOf(part, whole)` trả 0 khi mẫu số ≤ 0 thay vì `NaN` — trang thống kê luôn có trường hợp "chưa tiêu chí nào kết luận được", và `NaN%` lọt ra UI là lỗi không ai để ý tới khi đọc code.

Hai hook stub trong `shared/hooks` trước đây trả **giá trị giả** (`useDebounce` trả nguyên value, `useMediaQuery` luôn trả `false`) — nguy hiểm hơn là chưa có, vì nơi gọi tưởng nó chạy. Nay đã điền thật; `useMediaQuery` dùng `useSyncExternalStore` nên không lệch hydration, đổi lại **lần render đầu ở client luôn `false`** — nhánh ứng với `true` phải là nhánh phụ.

## T-14 · `queryFn` của TanStack Query không được trả `undefined`

`reviewsService.getReview()` trả `Review | undefined` (không tìm thấy thì `undefined`). Đưa thẳng vào `queryFn` thì TanStack Query coi đó là lỗi — `Query data cannot be undefined` — nên trang hồ sơ không tồn tại hiện **khung lỗi kèm nút "Thử lại"** thay vì khung "Không tìm thấy hồ sơ thẩm định này". Nút thử lại còn thử lại vô nghĩa mãi.

`undefined` là giá trị TanStack Query dành riêng để đánh dấu "chưa có dữ liệu". Cách xử lý: `queryFn` trả `?? null`, hook đổi ngược về `undefined` cho nơi gọi. Bắt được bằng cách mở trình duyệt thử một `reviewId` bịa — build và type check đều xanh.

## T-15 · `*/` trong JSDoc đóng sớm block comment

Viết `` `features/*/services/*.service.ts` `` trong một khối `/** ... */` làm dấu `*/` ở giữa đóng luôn comment, phần còn lại thành code → `error TS2304: Cannot find name 'services'`. Lỗi báo ở dòng comment nên rất dễ đọc nhầm.

Cách xử lý: đừng viết đường dẫn có glob trong block comment; diễn đạt bằng lời ("service của từng feature") hoặc dùng `//`.

## D-25 · Bộ tiêu chuẩn CHTK **chính là** danh sách tiêu chí, và do `features/rules` sở hữu

Một bộ tiêu chuẩn không phải thực thể tách rời tiêu chí — nó là **nội dung của một file Excel người dùng nạp lên**. Nạp file là tạo bộ; xem bộ là xem tiêu chí của nó. Vì vậy chủ sở hữu khái niệm này là `features/rules`, nơi đã sở hữu `Rule`.

Trang Tiêu chuẩn CHTK giờ xem **đúng một bộ tại một thời điểm**, chọn qua dropdown ở `StandardSetBar`. Trước đây trang hiển thị `MOCK_RULES` như thể đó là bộ duy nhất của cả dự án — sai về nghĩa ngay khi có bộ thứ hai.

Hệ quả kỹ thuật:

- `ruleKeys.list()` khóa theo **`standardSetId`**, không theo `workspaceSlug`: đổi bộ là đổi hẳn tập dữ liệu, và mỗi bộ giữ cache riêng nên bấm qua lại không tải lại.
- `RuleList` giữ danh sách, bộ lọc và các công tắc trong state cục bộ khởi tạo từ prop, mà state khởi tạo từ prop **không tự cập nhật khi prop đổi**. Container truyền `key={activeId}` để đổi bộ là dựng lại component — cũng đúng về nghĩa, vì bộ lọc của bộ cũ không còn ý nghĩa với bộ mới.
- Bộ đang chọn suy ra bằng biểu thức `chosenId ?? danh sách[0]?.id ?? ""`, **không** đồng bộ bằng `useEffect` — vừa thừa một lần render, vừa bị ESLint chặn (`react-hooks/set-state-in-effect`).

**Nợ để lại có ý thức:** `features/reviews` vẫn có `ChtkStandardSet` + `MOCK_STANDARD_SETS` riêng, phục vụ việc khác (chọn bộ nào để áp cho một hồ sơ thẩm định) và hiện liệt kê 2 bộ trong khi trang rules chỉ có 1. Chưa gộp vì gộp đòi hỏi đưa khái niệm này lên `shared` — việc đáng làm **khi có backend**, lúc đó cả hai bên đọc chung một endpoint và bản mock biến mất.

## D-26 · Nạp Excel là tính năng đầu tiên chạm backend thật — và được phép thất bại

`rulesService.importStandardSet()` **không phải mock**: nó gọi `apiClient.post` thật với `FormData` tới `POST /standard-sets/import`. Đây là chỗ duy nhất trong repo hiện gửi request ra ngoài.

Phạm vi cố ý hẹp — **chỉ gửi file đi**. Không parse Excel ở client, không nạp kết quả vào danh sách, không cập nhật dropdown. Việc đọc file thành tiêu chí thuộc về backend, nơi có quy tắc đọc cột và có chỗ ghi.

Backend chưa tồn tại nên lời gọi trả 404 và giao diện **hiện lỗi thật** ("Máy chủ trả về lỗi 404."). Đã cân nhắc giả lập thành công cho "đẹp demo" và bỏ, vì hai lý do: đường thành công giả không kiểm chứng được điều gì, và nó giấu mất đúng thứ cần thấy — hợp đồng với backend đã đi đúng dây chưa.

Chi tiết cần giữ:

- Kiểm file theo **đuôi file**, không theo `file.type`: Windows trả MIME rỗng hoặc `application/octet-stream` cho `.xlsx` tùy máy có cài Office hay không, lọc theo MIME sẽ chặn nhầm file hợp lệ. Đây chỉ là lớp chặn cho đỡ mất công gửi — backend vẫn phải kiểm lại.
- `apiClient` nhận ra `FormData` và **không** tự đặt `Content-Type`, để trình duyệt sinh boundary. Đặt tay là hỏng multipart.
- Chọn file khác thì gọi `mutation.reset()`, nếu không thông báo lỗi của lần gửi trước còn treo dưới file mới.
- Đường dẫn endpoint là chỗ giữ chỗ, hợp đồng dự kiến ghi ngay trong `rules.service.ts`. `NEXT_PUBLIC_API_BASE_URL` chưa đặt thì gọi vào cùng origin.

## T-16 · Next chèn sẵn một `role="alert"` rỗng — `getByRole("alert")` trong test phải giới hạn phạm vi

Next dựng `<div role="alert" aria-live="assertive" id="__next-route-announcer__">` ở gốc trang để đọc tên trang khi điều hướng. Nó **luôn có mặt và thường rỗng**.

Hệ quả: `page.locator('[role="alert"]').first()` trong Playwright có thể trúng thẻ này thay vì thông báo lỗi thật — test báo đỏ với thông báo rỗng, trong khi giao diện hiển thị hoàn toàn đúng. Mất một lượt debug mới ra.

Cách xử lý: luôn giới hạn phạm vi, ví dụ `page.getByRole("dialog").getByRole("alert")`.

## T-17 · Playwright không đọc được body của request multipart

`request.postData()` và `request.postDataBuffer()` đều trả `null` khi body là `FormData` có file. Không kiểm được "file có thật sự nằm trong request không" từ phía trình duyệt.

Cách xử lý đã dùng: dựng một HTTP server nhỏ ngoài repo, trỏ `NEXT_PUBLIC_API_BASE_URL` vào đó rồi đọc body nhận được ở phía server. Đây cũng là cách duy nhất kiểm được đường **thành công** và đường **lỗi có thông báo từ backend** khi backend thật chưa có.

## D-27 · Cầu nối backend đầu tiên: hợp đồng lấy từ `docs/api/conventions.md`, không tự suy

`shared/services/apiClient.ts` viết theo đúng envelope của backend (repo `arch-drawing-checker-backend`):

```
thành công      { "data": T }                     / { "data": T[], "meta": {…} }
lỗi (mọi loại)  { "error": { statusCode, code, message, details?, … } }
```

Bản trước đọc `message` ở **cấp cao nhất** — đúng với một API tưởng tượng, sai với API thật. Hệ quả: mọi câu tiếng Việt backend soạn sẵn ("Chỉ nhận file Excel .xlsx (không nhận .xls, .csv).") bị vứt, người dùng chỉ thấy "Máy chủ trả về lỗi 415."

Nguyên tắc rút ra: **`error.message` của backend là câu hiển thị cho người dùng, không phải log kỹ thuật** — giao diện dùng thẳng, chỉ nối thêm gợi ý hành động theo `error.code` (`IMPORT_ERROR_HINTS`). Tự soạn lại câu ở client là vừa trùng lặp vừa chắc chắn lệch.

`ApiError` nay mang `code` (UPPER_SNAKE, để `switch`) và `details` (chỉ có ở `VALIDATION_FAILED`). `isNotImplemented` tách riêng `501` — backend đang ở giai đoạn khung xương, phần lớn endpoint trả 501, và đó **không phải lỗi hệ thống**: không mời thử lại.

`NEXT_PUBLIC_API_BASE_URL` mặc định `http://localhost:4000/api/v1`. `.env.local` không commit (`.env*`), nên thêm `.env.example` kèm ngoại lệ `!.env.example` trong `.gitignore` để hợp đồng nằm trong repo.

## D-28 · Khóa mock của rules, vì nó mô tả một hình dạng dữ liệu không tồn tại

`MOCK_RULES` (67 tiêu chí) điền đủ `code`, `checkType`, `operator`, `value` cho **mọi** dòng. Dữ liệu thật đọc từ file CHTK (`TIEU CHI CHTK NHA O THAP TANG_gui CDS.xlsx`, 92 tiêu chí) qua backend:

```
code       null 41/92   (dòng biến thể theo loại nhà, không có mã riêng)
checkType  null 92/92   (Excel không có cột này)
operator   null 62/92
value      null 62/92
```

Giữ mock chạy song song sẽ dựng giao diện theo một thực tế sai — và đó chính là điều đã xảy ra: `RuleRow` dựng cột giữa quanh `operator` + `value`, hai trường vắng mặt ở 2/3 số dòng thật.

Hai file mock vẫn nằm trên đĩa, **comment từng dòng** (không bọc khối — bẫy T-15), export mảng rỗng để nơi còn import không gãy. Không khôi phục được: kiểu `Rule` nay đã khác.

**Thứ luôn có và luôn đọc được là `title` + `requirement`** (nguyên văn cột "Tiêu chuẩn áp dụng"). Giao diện lấy đó làm gốc: cột giữa hiện `operator` + `value` khi đọc được, còn lại hiện `requirementLines[0]`; cột mã hiện `↳ parentCode` khi `code` rỗng; badge loại kiểm tra hiện `–` kèm giải thích khi chưa phân loại.

Hệ quả ngoài feature rules: ô "Bộ tiêu chuẩn" của dashboard đọc `MOCK_RULES` nên giờ hiện **0/0 tiêu chí**, cho tới khi backend gỡ 501 ở `GET /{ws}/rules`.

## D-29 · Bộ tiêu chuẩn vừa nạp giữ trong bộ nhớ phiên, mất khi tải lại trang

`POST /{ws}/rules/import` đọc được Excel nhưng **chưa ghi CSDL**, và `GET /{ws}/rules` còn trả 501. Nên `rules.service.ts` giữ kết quả nạp trong một biến module (`sessionRuleSets`).

Đã cân nhắc và bỏ `sessionStorage` (cách `features/reviews` đang dùng cho hồ sơ nháp): ở đây nó sẽ giả vờ một sự bền vững mà **máy chủ thật sự không có**, đúng thứ D-26 đã từ chối. Trạng thái rỗng nói thẳng lý do: "Máy chủ chưa lưu bộ đã nạp, nên tải lại trang là phải nhập lại", và modal nhắc lại sau khi nạp xong.

Bỏ `sessionRuleSets` khi backend gỡ 501; lúc đó hai hàm `list*` chỉ còn một lời gọi `apiClient.get`, chữ ký giữ nguyên nên hook và container không phải sửa.

## D-30 · `warnings[]` của lần nạp là thông tin hạng nhất, không phải log

Backend trả kèm danh sách dòng đáng ngờ khi đọc Excel — file mẫu có 7: `DUPLICATE_CODE` ("Mã 5.3.3 trùng với dòng 122"), `UNKNOWN_HOUSE_TYPE`, `AMBIGUOUS_HOUSE_TYPE` ("\"Villa\" đứng riêng — đã hiểu là Single Villa, cần xác nhận"), `CODE_OUT_OF_ORDER`.

Đây là những chỗ máy **đã đoán** khi đọc file gốc. Người thẩm định cần biết để mở file ra đối chiếu, nên modal hiện chúng kèm `sourceRow`, thu gọn trong `<details>` để không lấn át kết quả chính. Cùng lý do với nguyên tắc 6 (luôn hiện độ tin cậy cạnh kết luận tự động).

## T-18 · Danh sách bộ lọc theo trường có thể rỗng — phải loại trừ tường minh

`filters.checkType.includes(rule.checkType)` với `rule.checkType: CheckType | null` vừa sai kiểu vừa sai nghĩa. Quy ước đã chọn: tiêu chí **chưa có** giá trị thì **không khớp** khi người dùng lọc theo trường đó — lọc là để thu hẹp về những dòng chắc chắn thuộc nhóm đã chọn, không phải để gom cả những dòng chưa biết.

## T-19 · `??` không trộn được với `||` mà không có ngoặc

`{rule.requirementLines[0] ?? rule.requirement || "—"}` làm Turbopack gãy ngay khi parse: *"Nullish coalescing operator(??) requires parens when mixing with logical operators"*. Đây là lỗi cú pháp JS, không phải lỗi type — `npm run build` báo ở bước biên dịch chứ không phải bước type check.
