# Mô hình miền

Toàn bộ từ vựng nghiệp vụ của dự án. Khi cần một nhãn, một màu hay một thứ tự — lấy ở đây, đừng tự đặt.

Nguồn sự thật trong code:

- `shared/constants/enums.ts` — kiểu dữ liệu
- `shared/constants/domain.ts` — nhãn, màu, thứ tự, mô tả, hàm suy dẫn (gồm cả `STATUS_CONFIG` và `SEVERITY_CONFIG`)
- `app/globals.css` — giá trị màu

Thêm một giá trị enum thì phải cập nhật **cả ba** file trên **và** `design-system.md`, trong cùng một lần sửa.

## 1. Phân cấp

```
Workspace  /[slug]
  └── Zone            /[slug]/zones/[zoneId]
        └── Review (hồ sơ thẩm định)   /[slug]/reviews/[reviewId]
              └── Drawing page (trang PDF)
                    └── Finding (kết quả của một tiêu chí)
```

- **Rule** (quy tắc / tiêu chí CHTK) là danh mục dùng chung, không thuộc hồ sơ nào. Nằm ở `/[slug]/rules`.
- **Finding** là kết quả khi đem một Rule đối chiếu với một trang bản vẽ trong một Review.
- Một Rule có `code` (ví dụ `1.3.1`); Finding dùng lại chính chuỗi đó ở trường `ruleIndex`.
- Mỗi Finding có `boundingBox` (vùng khoanh trên trang, tính theo % 0–100, không phụ thuộc độ phân giải) và `note?` (ghi chú của chuyên gia). Ở khung xem bản vẽ (`/[slug]/reviews/[reviewId]`), `boundingBox` là mock ngẫu nhiên có seed cố định — chưa có backend trả tọa độ thật do VLM xác định.

## 2. FindingStatus — kết luận của một tiêu chí

| Giá trị | Nhãn tiếng Việt | Ý nghĩa |
|---|---|---|
| `pass` | Đạt | Giá trị trên bản vẽ nằm trong tiêu chuẩn |
| `fail` | Không đạt | Lệch khỏi tiêu chuẩn, phải sửa bản vẽ |
| `warning` | Cảnh báo | Có dấu hiệu lệch nhưng chưa chắc chắn |
| `pending` | Chờ người thẩm định | Có kết luận sơ bộ, chờ người xác nhận |
| `approved` | Đã duyệt | Người thẩm định đã xác nhận kết luận của máy |
| `unknown` | Không xác định | Không trích xuất được dữ liệu để đối chiếu |

Thứ tự hiển thị (`STATUS_ORDER`): fail → warning → pending → pass → approved → unknown. Nặng trước, xong sau.

Hai tập con dùng khi tính số liệu: `ACTION_REQUIRED_STATUSES` = fail + warning + pending; `PASSED_STATUSES` = pass + approved.

Màu: fail đỏ · warning hổ phách · pending xanh dương · pass xanh lá · **approved tím** · unknown xám. Approved dùng tím chứ không phải teal — xem `decisions.md` D-14.

**Luật:** `warning` là trạng thái hạng nhất, không phải biến thể của `fail`. Kết quả dưới ngưỡng tin cậy phải là `warning` hoặc `pending`, không được ép thành `fail`.

## 3. FindingSeverity — mức độ

`low` Thấp · `medium` Trung bình · `high` Cao · `critical` Nghiêm trọng.

Thứ tự sắp xếp: critical → high → medium → low.

Mức độ và trạng thái là **hai trục độc lập**: mức độ nói vi phạm nặng tới đâu, trạng thái nói tiêu chí kết luận ra sao. Không gộp thành một badge.

## 4. CheckType — loại kiểm tra

| Mã | Tên | Phương pháp | Tin cậy kỳ vọng |
|---|---|---|---|
| A | Đối chiếu số đo | OCR chuỗi kích thước / cote, chuẩn hóa đơn vị, so ngưỡng | 85–95% |
| B | Đối chiếu vật liệu / thông số | Regex trên ghi chú bản vẽ kèm ngữ cảnh | 70–85% |
| C | Phân tích hình học | VLM đọc mặt cắt, xác định chi tiết có đúng cấu tạo không | 55–70% |
| D | Phán đoán chủ quan | Tiêu chí định tính, máy chỉ gợi ý | dưới 55% |

`ReasoningGroup` là tên cũ, nay là alias của `CheckType` — code mới dùng `CheckType`.

## 5. ChtkCategory — nhóm tiêu chuẩn CHTK

| Mã | Tên đầy đủ | Tên rút gọn |
|---|---|---|
| 1.x | Mặt ngoài công trình | Mặt ngoài |
| 2.x | Kích thước công trình | Kích thước |
| 3.x | Thang bộ – Ramp hầm | Thang – Ramp |
| 4.x | Chi tiết cấu tạo điển hình | Cấu tạo |
| 5.x | Chi tiết hoàn thiện điển hình | Hoàn thiện |

Suy ra từ chữ số đầu của mã tiêu chí bằng `categoryFromRuleIndex()`. Không lưu riêng, không để backend và frontend tự suy khác nhau.

Hiển thị: header nhóm và menu lọc dùng **tên đầy đủ + chấm màu**; dòng dữ liệu dày dùng **tên rút gọn**.

## 6. HouseType — loại nhà

| Giá trị | Viết tắt | Tên đầy đủ |
|---|---|---|
| `shophouse` | SH | Shophouse |
| `townhouse` | TH | Townhouse / Nhà phố liên kế |
| `semi-villa` | SV | Semi Villa |
| `single-villa` | SGV | Single Villa |
| `shop-villa` | SHV | Shop Villa |

Một Rule mang mảng `houseTypes`. Đủ cả năm thì hiển thị "Mọi loại nhà"; còn lại hiển thị viết tắt ngăn nhau bằng dấu phẩy, **luôn theo thứ tự SH → SHV** bất kể thứ tự trong dữ liệu (`houseTypeScopeLabel`). Tên đầy đủ để trong tooltip (`houseTypeFullLabel`).

Lọc theo một loại nhà thì rule "Mọi loại nhà" vẫn khớp, vì mảng của nó chứa đủ năm.

> Phạm vi đề tài chốt ở nhà ở biệt thự / nhà dân. Enum có đủ năm loại vì bộ tiêu chuẩn CHTK dùng chung, nhưng đừng mở rộng tính năng theo loại nhà khác khi chưa hỏi.

## 7. ComparisonOperator — phép so sánh của Rule

`gte` Tối thiểu (≥) · `lte` Tối đa (≤) · `eq` Bằng đúng (=) · `between` Trong khoảng · `in-list` Thuộc danh sách · `pattern` Khớp mẫu · `required` Phải có · `forbidden` Không được có.

Trong bảng mock gốc, "Không có" ánh xạ sang `forbidden`.

## 8. Confidence

Số thực 0–1 trên mỗi Finding. Ngưỡng `CONFIDENCE_THRESHOLD = 0.8`.

Trên ngưỡng hiển thị màu trung tính, dưới ngưỡng chuyển hổ phách. Cố tình **không dùng thang xanh–đỏ** để không cạnh tranh thị giác với trạng thái.

## 9. ReviewStatus / ProcessingState

`draft | processing | completed` và `idle | running | failed`. Đã có token màu, chưa dùng ở đâu vì trang reviews còn vỏ rỗng.

## 10. Dữ liệu mock hiện có

| File | Nội dung |
|---|---|
| `features/rules/mocks/rules.mock.ts` | 67 rule, lấy nguyên văn từ bảng CHTK người dùng cung cấp. Phân bố loại kiểm tra: A 38, B 25, C 3, D 1 |
| `features/findings/mocks/findings.mock.ts` | 1 hồ sơ `PN2-DN-01` — "Bản vẽ mẫu PN2 Đà Nẵng — Shophouse điển hình", 66 finding phủ đủ 6 trạng thái. Phân bố trạng thái: fail 21, warning 9, pending 3, pass 22, approved 7, unknown 4. Mức độ: critical 4, high 10, medium 19, low 33 |
| `features/reviews/mocks/reviews.mock.ts` | 6 hồ sơ: 4 đã xong, 1 đang xử lý 62%, 1 lỗi xử lý. `statusCounts` của `rv-2026-018` phải khớp findings mock |

Cùng một mã tiêu chí thì `checkType` ở rules mock và findings mock **phải giống nhau**.

Tên tiêu chí trong mock lấy **nguyên văn** từ tài liệu gốc. Giá trị trích xuất / tiêu chuẩn trong mock findings là **số liệu giả lập để dựng giao diện**, không phải tiêu chuẩn thật.
