# Giai đoạn 08 — Cầu nối backend đầu tiên: nạp Excel thành bộ tiêu chuẩn

**2026-09-23.** Trang Tiêu chuẩn CHTK không còn mock. Nạp một file Excel → backend đọc → giao diện hiển thị bộ tiêu chuẩn thật.

Quyết định: **D-27** (hợp đồng apiClient), **D-28** (khóa mock của rules), **D-29** (bộ nhớ phiên), **D-30** (`warnings[]` là thông tin hạng nhất). Bẫy: **T-18**, **T-19**.

Nguồn hợp đồng: `arch-drawing-checker-backend/docs/frontend-integration.md` + `docs/api/conventions.md`.

## Đối chiếu tài liệu trước khi code

Tài liệu ghép nối có vài chỗ nói về frontend đã lỗi thời — đáng báo lại bên backend:

- §1.1 "`apiClient.ts` (đang là stub `reject`)" — đã hiện thực từ giai đoạn 06.
- §2.1 còn nhắc `reviewsService.listZoneOptions()` / `listStandardSets()`, nay đã gộp thành `listFormOptions()`.
- §2.2 ghi endpoint import "(chưa có)" — thực tế **đã chạy**.

Ngược lại, frontend sai ở những chỗ quan trọng hơn, và chỉ lộ ra khi gọi thật.

## Cái sai đắt nhất: đọc nhầm tầng của thông báo lỗi

`apiClient` đọc `payload.message`; backend trả `{ error: { statusCode, code, message, details } }`. Mọi câu tiếng Việt backend soạn sẵn bị vứt:

```
415 UNSUPPORTED_MEDIA_TYPE  "Chỉ nhận file Excel .xlsx (không nhận .xls, .csv)."
400 EXCEL_UNREADABLE        "Không đọc được file Excel (hỏng hoặc không phải .xlsx)."
400 EXCEL_FILE_REQUIRED     "Thiếu file Excel ở trường \"file\" (multipart/form-data)."
```

Người dùng chỉ thấy "Máy chủ trả về lỗi 415." Không phép kiểm nào ở giai đoạn 07 bắt được, vì lúc đó endpoint chưa tồn tại và mọi lỗi đều là 404 — **đường lỗi giả không kiểm chứng được hợp đồng lỗi thật**.

## Dữ liệu thật khác mock đến mức nào

File `TIEU CHI CHTK NHA O THAP TANG_gui CDS.xlsx` qua backend: 1 sheet ("4 SAO"), **92 tiêu chí**, 5 nhóm (18/13/9/42/10).

```
code       null 41/92   ← dòng biến thể theo loại nhà, không có mã riêng
checkType  null 92/92   ← Excel không có cột này
operator   null 62/92
value      null 62/92
```

`MOCK_RULES` điền đủ bốn trường đó cho **cả 67 dòng**. Giao diện vì thế đã dựng cột giữa quanh `operator` + `value` — hai trường vắng ở 2/3 số dòng thật. Đây là lý do khóa mock (D-28) chứ không phải để dọn dẹp: mock đang dạy sai về hình dạng dữ liệu.

Cách hiển thị mới lấy `title` + `requirement` làm gốc — hai thứ luôn có:

| Cột | Khi đủ dữ liệu | Khi rỗng |
|---|---|---|
| Mã | `1.4.1` | `↳ 4.1.2` + tooltip giải thích dòng biến thể, kèm `headings` |
| Giữa | chip phép so sánh + giá trị | `requirementLines[0]`, tooltip liệt kê đủ các gạch đầu dòng |
| Loại kiểm tra | badge A–D | `–` + tooltip "Excel không có cột loại kiểm tra" |

## Kiểm chứng

`npm run build` sạch. `npm run lint` vẫn đúng **một** lỗi có sẵn từ trước (`ThemeToggle.tsx:23`).

17 phép kiểm chạy qua Playwright + Edge, **đối thoại với backend thật ở `localhost:4000`, nạp file CHTK thật**:

- Mock đã khóa: vào trang lần đầu không có bộ nào, 0 công tắc, nút nạp vẫn còn (lối thoát duy nhất).
- Gọi đúng `POST /api/v1/workspaces/arch-drawing-checker-ai/rules/import`, backend trả **200**.
- Modal hiện "Đã đọc 1 bộ", tên bộ + **92 tiêu chí** + sheet "4 SAO", **7 dòng cần xem lại**, và câu nhắc máy chủ chưa lưu.
- Đóng modal → bộ vừa nạp được chọn sẵn, danh sách hiện **đúng 92** công tắc, đủ 5 nhóm CHTK.
- Dòng thiếu mã hiện `↳`, cột loại kiểm tra hiện `–`, cột giữa hiện nguyên văn tiêu chuẩn.
- Không lỗi console.

Ba đường lỗi kiểm riêng bằng `curl` vào backend thật: `.txt` → 415, `.xlsx` giả → 400 `EXCEL_UNREADABLE`, thiếu file → 400 `EXCEL_FILE_REQUIRED`.

Một lỗi bố cục chỉ thấy khi nhìn ảnh chụp: tên bộ đọc từ file dài hơn hẳn tên mock, đẩy nút "Nhập bộ tiêu chuẩn" xuống hàng dưới và **dạt trái** — `justify-between` hết tác dụng khi hàng chỉ còn một phần tử. Thêm `ml-auto`.

## Còn nợ lại

- `GET /{ws}/rules` và `GET /{ws}/rules/:id` còn **501** → bộ đã nạp mất khi tải lại trang (D-29), và dashboard hiện 0/0 tiêu chí (D-28).
- Công tắc bật/tắt, thêm/sửa/xóa tiêu chí, "Tải Excel mẫu": endpoint đều 501.
- `apiClient` chưa trả `meta` khi phân trang — chưa nơi nào cần (rules cố ý không phân trang, conventions §3).
- Ngữ nghĩa "bộ rules áp dụng cho phân khu" (`/zones/[zoneId]/rules`) **chưa định nghĩa** — tài liệu backend ghi rõ là phải hỏi người dùng trước khi làm.
- `features/reviews` vẫn giữ `ChtkStandardSet` + mock riêng; gộp khi 501 được gỡ.
