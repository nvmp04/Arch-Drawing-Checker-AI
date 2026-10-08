# Giai đoạn 07 — Chọn bộ tiêu chuẩn + nạp Excel lên backend

**2026-09-23.** Trang Tiêu chuẩn CHTK có dropdown chọn bộ, và nút nạp Excel được mở khóa với đúng **một** việc: gửi file lên backend.

Quyết định sinh ra: **D-25** (bộ tiêu chuẩn = rules, do `features/rules` sở hữu), **D-26** (nạp Excel là lời gọi backend thật, được phép thất bại). Bẫy mới: **T-16**, **T-17**.

## Vấn đề

Trang rules hiển thị `MOCK_RULES` như thể đó là bộ tiêu chuẩn duy nhất của cả dự án. Sai về nghĩa: một bộ tiêu chuẩn **chính là** nội dung một file Excel người dùng nạp lên, nên phải có nhiều bộ và phải chọn được xem bộ nào.

Điểm cần làm rõ trong lúc làm: `ChtkStandardSet` + mock đang nằm ở `features/reviews`, mà luật 10 cấm feature import feature. Cách giải: `features/rules` là chủ sở hữu đúng của khái niệm này (nó đã sở hữu `Rule`), nên tự khai type + mock của mình; bản bên `features/reviews` phục vụ việc khác (chọn bộ để áp cho một hồ sơ) và **để nguyên**, ghi thành nợ. Gộp khi có backend — xem D-25.

## Bố cục: vì sao hai nút tách hàng

Yêu cầu chỉ nói "không nằm cùng cấp", phần còn lại tự quyết. Căn cứ đã dùng: **hai nút thao tác ở hai cấp dữ liệu khác nhau.**

```
┌─ BỘ TIÊU CHUẨN ĐANG XEM ──────────────────────────────────────┐
│ [Bộ CHTK 4 sao ▾]  chtk-4-sao-v1.xlsx · 67 tiêu chí · 2026-08-20   [⇧ Nhập bộ tiêu chuẩn] │
└───────────────────────────────────────────────────────────────┘
  [▽ Bộ lọc]  67 tiêu chí                              [+ Thêm tiêu chí mới]
  ┌─ 1. Mặt ngoài công trình  17 ────────────────────────────────┐
```

Nạp Excel tạo ra **cả một bộ** → cùng cấp với dropdown, nằm trong cùng thẻ. Thêm tiêu chí chỉ thêm **một dòng trong bộ đang xem** → cùng cấp với thanh lọc. Nút nạp dùng kiểu viền (thứ cấp), nút thêm giữ nền accent (chính), để không hai nút cùng tranh sự chú ý.

## Nạp Excel — phạm vi đúng một việc

`rulesService.importStandardSet()` gửi `FormData` (`file` + `workspaceSlug`) tới `POST /standard-sets/import` qua `apiClient`. Không parse Excel ở client, không nạp vào danh sách, không đụng dropdown.

Backend chưa có → 404 → giao diện hiện **"Máy chủ trả về lỗi 404."**. Giữ nguyên, không giả lập thành công: đường thành công giả không kiểm chứng được gì và giấu mất đúng thứ cần thấy.

## Kiểm chứng

`npm run build` sạch. `npm run lint` vẫn đúng **một** lỗi có sẵn từ trước ở `ThemeToggle.tsx:23`.

Kiểm bằng Playwright + Edge (xem `06-*.md`). 13 phép kiểm giao diện đều PASS: dropdown một lựa chọn, siêu dữ liệu đúng, nút đã đổi tên, không còn "Nhập Excel", **hai nút đo được ở hai hàng khác nhau** (y=126 vs y=190), đủ 67 tiêu chí, chặn file `.txt`, nút gửi khóa/mở đúng lúc, POST đi đúng dạng multipart, và lỗi 404 hiện ra đúng.

Vì T-17 (Playwright không đọc được body multipart), phần "file có thật sự tới nơi không" phải kiểm bằng **HTTP server thật** dựng ngoài repo, trỏ `NEXT_PUBLIC_API_BASE_URL` vào đó. Kết quả server nhận được:

```json
{"contentType":"multipart/form-data; boundary=----WebKitFormBoundary...","byteLength":408,
 "fields":["file","bo-tieu-chuan-kiem-thu.xlsx","workspaceSlug"],
 "filenames":["bo-tieu-chuan-kiem-thu.xlsx"],
 "containsFileBytes":true,"containsWorkspaceSlug":true}
```

Nhờ có server thật, kiểm được cả hai đường mà backend thật chưa cho kiểm:

- **201** → giao diện hiện đúng tên bộ và số tiêu chí *do backend trả về*, nút gửi biến mất.
- **400 kèm `{ message }`** → giao diện hiện đúng câu của backend ("File thiếu cột 'Mã tiêu chí'."), nút gửi còn đó để thử lại.

Tức hợp đồng ghi trong `rules.service.ts` đã được chạy thật, không chỉ là chú thích.

## Ghi chú cho lần sau

Hai bẫy tốn thời gian, đều ở **phía test** chứ không phải sản phẩm: Next chèn sẵn một `role="alert"` rỗng làm test đo nhầm (**T-16**), và Playwright không đọc được body multipart (**T-17**).

Khi backend có thật, việc còn lại ở chỗ này: hiện bộ vừa nạp trong dropdown và chọn luôn nó — `useImportStandardSet` đã `invalidate` sẵn khóa `standardSets`.
