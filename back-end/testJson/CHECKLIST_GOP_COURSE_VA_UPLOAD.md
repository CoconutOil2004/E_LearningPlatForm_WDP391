# Checklist: Gộp logic Course + API Upload video riêng

## Quan điểm

- **Section / curriculum** đều thao tác trên document **Course** (sections[], sections[].items[]) → về bản chất đều là **update course**. Dữ liệu chủ yếu là string (title, videoUrl, …) nên payload nhẹ.
- **FE** muốn: mỗi lần add video cho lesson → **gọi API upload video trước** → hứng **url** (và duration) → sau đó add lesson chỉ gửi **string** (videoUrl, duration, title), không gửi file trong request add lesson.

---

## Checklist cần làm

### 1. API Upload video (riêng, dùng chung)

| # | Việc | Trạng thái |
|---|------|------------|
| 1.1 | Thêm **POST /api/upload/video**: nhận file video (multipart, field `video`), upload lên Cloudinary, **chỉ trả về** `{ videoUrl, publicId, duration }` (seconds). Không tạo Lesson, không đụng Course. | ✅ Đã làm |
| 1.2 | Bảo vệ route upload video bằng **protect** (chỉ user đăng nhập mới upload). | ✅ Đã làm |
| 1.3 | FE: gọi upload video → lưu `videoUrl`, `duration`, `publicId` → khi add lesson gửi 3 field này trong body JSON. | FE |

---

### 2. Add lesson chỉ nhận JSON (videoUrl, duration, không nhận file)

| # | Việc | Trạng thái |
|---|------|------------|
| 2.1 | Sửa **POST .../sections/:sectionIndex/lessons**: body **JSON** `{ title?, videoUrl, duration?, videoPublicId? }`. Bỏ multer/upload trong route này. | ✅ Đã làm |
| 2.2 | Trong controller add lesson: không gọi Cloudinary; tạo Lesson từ `videoUrl`, `videoPublicId`, `duration`, `title`; push item vào section; cập nhật `course.totalDuration`. | ✅ Đã làm |
| 2.3 | Validation: `videoUrl` bắt buộc; `duration` optional (mặc định 0). | ✅ Đã làm |

---

### 3. Gộp / nhất quán logic “Course” (section = update course)

| # | Việc | Trạng thái |
|---|------|------------|
| 3.1 | Giữ nguyên các API hiện có: **create course**, **update course** (thông tin cơ bản), **add/update/delete section**, **add lesson** (JSON), **add quiz**. Tất cả đều thao tác trên Course (hoặc document con Lesson/Quiz được link từ Course). Không bắt buộc gộp thành 1 API “PUT course full” nếu FE thích flow từng bước. | Đã đúng |
| 3.2 | (Tùy chọn) Thêm **PUT /api/courses/:id/curriculum** nhận body là **toàn bộ sections** (mảng section, mỗi section có title + items[] với itemType, itemId, title, orderIndex). BE so sánh với hiện tại, cập nhật/ thêm/xóa section và items cho khớp. Phức tạp hơn, chỉ làm nếu FE cần “save toàn bộ curriculum một lần”. | Tùy chọn |
| 3.3 | Tài liệu / testJson: ghi rõ “section & curriculum = update course”, và luồng FE: **upload video → lấy url → add lesson (body JSON)**. | Cập nhật testJson |

---

### 4. Upload: route và cấu trúc

| # | Việc | Trạng thái |
|---|------|------------|
| 4.1 | Đặt route upload video ở **/api/upload/video** (dùng chung). | ✅ Đã làm |
| 4.2 | Dùng chung middleware upload video (multer memory + Cloudinary); controller upload **chỉ** upload và trả về `{ success, data: { videoUrl, publicId, duration } }`. | ✅ Đã làm |

---

### 5. TestJson / tài liệu

| # | Việc | Trạng thái |
|---|------|------------|
| 5.1 | Thêm file **uploadVideo.json** (đã có): method POST, endpoint upload video, body multipart (field `video`), response mẫu `{ videoUrl, publicId, duration }`. | ✅ Đã làm |
| 5.2 | Sửa **10_addLesson.json**: body JSON `title`, `videoUrl`, `duration`, `videoPublicId`; bỏ mô tả multipart; ghi chú “FE gọi API upload video trước, rồi gửi url + duration vào đây”. | ✅ Đã làm |
| 5.3 | Cập nhật **FLOW_TAO_COURSE.md**: bước add lesson = “upload video → add lesson (JSON)”. | ✅ Đã làm |

---

## Tóm tắt thay đổi kỹ thuật

1. **Mới:** **POST /api/upload/video** (protect) → multipart `video` → Cloudinary → response `{ videoUrl, publicId, duration }`.
2. **Sửa:** **POST .../lessons** nhận **JSON** `videoUrl`, `duration`, `videoPublicId?`, `title?`; bỏ multer ở route lessons.
3. **Giữ:** Create/update course, add/update/delete section, add quiz như cũ (đều là thao tác trên course / curriculum). Có thể bổ sung PUT curriculum full (tùy chọn).

Sau khi làm xong checklist, FE chỉ cần: **upload video → hứng url (và duration) → gọi add lesson với các string đó.**
