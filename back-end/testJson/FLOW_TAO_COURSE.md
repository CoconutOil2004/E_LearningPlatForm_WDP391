# Luồng tạo hoàn thành 1 Course – API cần dùng (chỉ CRUD course)

## 1. Cấu trúc 1 Course trên hệ thống

```
Course (title, category, level, sections[], totalDuration, ...)
  └── sections[] (các chương)
        └── section (title, items[])
              └── items[] (lesson hoặc quiz)
                    ├── item { itemType: "lesson", itemId → Lesson (videoUrl, duration) }
                    └── item { itemType: "quiz", itemId → Quiz (questions) }
```

- **Course** = 1 khóa học. Curriculum (sections + items) nằm trong `course.sections`.
- **Section** = 1 chương (title + items[]).
- **Lesson** = bài học video (được tạo bởi BE khi PUT course với item không có `itemId` + có `videoUrl`).
- **Quiz** = bài quiz (được tạo bởi BE khi PUT course với item không có `itemId` + có `questions`).

**Quan trọng:** Không còn API riêng cho section/lesson/quiz. FE gửi **toàn bộ sections** trong body **PUT /api/courses/:courseId**; BE tự tạo Lesson/Quiz mới cho item không có `itemId`, xóa Lesson/Quiz cũ không còn tham chiếu.

---

## 2. Luồng FE: tạo/sửa course và curriculum

### Bước 1: Tạo khóa học

| API | Method | Endpoint | Mục đích |
|-----|--------|----------|----------|
| Tạo course | POST | `/api/courses/` | Tạo Course (title, description, categoryId, level). Trả về `data._id` (courseId). |

**Body:** `title`, `description`, `categoryId`, `level`, `thumbnail?` (URL ảnh, optional).  
**Response:** course có `_id` → dùng cho PUT và GET.

---

### Bước 2a: Upload ảnh (thumbnail, optional)

| API | Method | Endpoint | Mục đích |
|-----|--------|----------|----------|
| Upload ảnh | POST | `/api/upload/images` | Multipart field `images` (nhiều file). Trả về `data: [ { url, publicId }, ... ]`. |

FE lấy `data[0].url` gửi vào POST/PUT course là `thumbnail`. Không chọn ảnh thì không gửi (BE để null).

---

### Bước 2b: Upload video (khi thêm lesson mới có video)

| API | Method | Endpoint | Mục đích |
|-----|--------|----------|----------|
| Upload video | POST | `/api/upload/video` | Multipart field `video`. Trả về `{ videoUrl, publicId, duration }`. |

FE gọi 1 lần cho mỗi video; lưu `videoUrl`, `duration`, `publicId` để đưa vào body PUT course (trong `sections[].items[]`).

---

### Bước 3: Cập nhật khóa (kèm curriculum) – một lần

| API | Method | Endpoint | Mục đích |
|-----|--------|----------|----------|
| Cập nhật course | PUT | `/api/courses/:courseId` | Cập nhật thông tin cơ bản và/hoặc **sections** (toàn bộ curriculum). |

**Body có thể gồm:** `title`, `description`, `categoryId`, `level`, `price`, `status`, **`sections`**.

**sections** = mảng:

```json
[
  {
    "title": "Chương 1",
    "items": [
      {
        "itemType": "lesson",
        "itemRef": "Lesson",
        "title": "Bài 1",
        "orderIndex": 1,
        "videoUrl": "https://res.cloudinary.com/.../video.mp4",
        "duration": 120,
        "videoPublicId": "xyz"
      },
      {
        "itemType": "quiz",
        "itemRef": "Quiz",
        "title": "Quiz 1",
        "orderIndex": 2,
        "questions": []
      }
    ]
  }
]
```

- **Item có `itemId`** (ObjectId có sẵn): BE giữ (chỉ cập nhật title/order nếu cần).
- **Item không có `itemId`:**
  - `itemType: "lesson"` và có `videoUrl` → BE tạo **Lesson** mới, gán `itemId`.
  - `itemType: "quiz"` và có `questions` (array) → BE tạo **Quiz** mới, gán `itemId`.
- Lesson/Quiz **cũ** không còn xuất hiện trong `sections` mới sẽ bị BE **xóa** (và video Cloudinary của lesson cũ bị xóa nếu có).

---

### Bước 4: Xem chi tiết course (instructor / admin)

| API | Method | Endpoint | Mục đích |
|-----|--------|----------|----------|
| Chi tiết course | GET | `/api/courses/:id` | Lấy full course kèm `sections` đã populate (itemId → Lesson/Quiz). |

Dùng để preview / chỉnh sửa lại; FE có thể gửi lại toàn bộ `sections` qua PUT khi save.

---

### Học viên đã mua: xem danh sách bài học

| API | Method | Endpoint | Mục đích |
|-----|--------|----------|----------|
| Danh sách lesson | GET | `/api/courses/:courseId/lessons` | Chỉ lesson (không quiz), đã sắp xếp; yêu cầu đã enroll. |

---

## 3. Tóm tắt số lần gọi API (ví dụ)

| Mục tiêu | Cách gọi |
|----------|----------|
| 1 khóa + 1 chương + 1 bài video | POST course → POST upload-video → PUT course với `sections: [{ title: "Chương 1", items: [{ itemType: "lesson", title, orderIndex: 1, videoUrl, duration, videoPublicId }] }]` |
| 1 khóa, 2 chương, mỗi chương 2 lesson | 1 POST course + 4 POST upload-video (4 video) + 1 PUT course với `sections` chứa 2 section, mỗi section 2 item lesson (videoUrl/duration từ 4 lần upload). |
| Sửa curriculum (thêm/xóa/sửa section hoặc item) | GET course (lấy sections hiện tại) → chỉnh trên FE → PUT course với `sections` mới (item giữ thì gửi kèm `itemId`, item mới không gửi `itemId`). |

**Tóm lại:** FE chỉ cần **CRUD course** (create, GET, PUT) + **upload-video** + **GET lessons** (cho học viên). Curriculum luôn được gửi qua body **PUT course** với trường **sections**.
