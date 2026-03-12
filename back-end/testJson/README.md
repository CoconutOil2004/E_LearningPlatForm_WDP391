# testJson – Payload mẫu API Course (FE tham khảo)

**Base URL course:** `http://localhost:9999/api/courses`  
**Base URL upload:** `http://localhost:9999/api/upload`

API course: **CRUD course** (create, update, get by id, preview). Upload ảnh/video dùng **/api/upload** (images nhiều + video). Curriculum qua **PUT /:courseId** với `sections`. GET `/:id` = course detail (admin/instructor thoải mái; student phải enroll).

---

## Bảo vệ (protect)

Các API có `"protect": true` cần header:

```
Authorization: Bearer <access_token>
```

---

## Danh sách API

| # | File | Method | Endpoint | Bảo vệ |
|---|------|--------|----------|--------|
| 0 | `00_headers_protect.json` | — | — | Mô tả Bearer token |
| 1 | `01_search.json` | GET | `/api/courses/search` | Không |
| 2 | `02_levels.json` | GET | `/api/courses/levels` | Không |
| 3 | `04_createCourse.json` | POST | `/api/courses/` | protect |
| 4 | `05_updateCourse.json` | PUT | `/api/courses/:courseId` | protect |
| 5 | `06_uploadVideo.json` | POST | `/api/upload/video` | protect |
| 5b | `06b_uploadImages.json` | POST | `/api/upload/images` | protect |
| 6 | `07_getCourseById.json` | GET | `/api/courses/:id` | protect (admin/instructor hoặc student đã enroll) |
| 7 | `08_getCoursePreview.json` | GET | `/api/courses/:id/preview` | Không – syllabus only |

---

## Content-Type

- **JSON:** `Content-Type: application/json`
- **Upload video:** POST `/api/upload/video`, field `video` (multipart).
- **Upload ảnh:** POST `/api/upload/images`, field `images` (nhiều file, multipart). Dùng `data[0].url` làm thumbnail course.

---

## Luồng FE

1. **Tạo khóa:** POST `/api/courses/` (body có thể có `thumbnail` URL nếu đã upload ảnh).
2. **Upload ảnh (thumbnail):** POST `/api/upload/images` → lấy `data[0].url` → gửi trong POST/PUT course là `thumbnail`.
3. **Upload video (lesson):** POST `/api/upload/video` → lấy `videoUrl`, `duration`, `publicId` → gửi trong PUT course `sections[].items[]`.
4. **Cập nhật khóa:** PUT `/api/courses/:courseId` với `sections`, `thumbnail`, v.v.

---

## Tài liệu kèm theo

- **MODEL_API_MAPPING.md** – Model vs request/response.
- **FLOW_TAO_COURSE.md** – Luồng tạo course.
