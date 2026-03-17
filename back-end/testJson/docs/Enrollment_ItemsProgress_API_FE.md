# Hướng dẫn API Tiến độ học (Enrollment + itemsProgress) – Cho Frontend

Tài liệu mô tả cách gọi và dùng các API liên quan đến **tiến độ học**: enroll, danh sách khóa của tôi, chi tiết khóa (có itemsProgress), hoàn thành lesson, heartbeat, quiz-done, kiểm tra quyền xem lesson.

**Base URL:** `http://localhost:9999` (hoặc theo `SERVER_URL` / env của dự án).

**Xác thực:** Các API bên dưới đều cần header:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Token lấy từ **POST /api/auth/login** (email + password) → response `token`.

---

## 1. Đăng ký khóa học miễn phí (Enroll Free)

**Khi nào dùng:** User bấm "Enroll" / "Tham gia" vào khóa **free** (giá = 0). Sau khi gọi thành công, BE tự tạo enrollment và **đổ full syllabus vào itemsProgress** (lesson đầu = progress, còn lại = lock; quiz = open).

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/enrollments/enroll-free` |
| **Body** | `{ "courseId": "<courseId>" }` |

**Response thành công (201 hoặc 200):**

```json
{
  "success": true,
  "message": "Successfully enrolled in free course",
  "data": {
    "enrollmentId": "...",
    "courseId": "...",
    "paymentStatus": "paid",
    "progress": 0,
    "createdAt": "..."
  }
}
```

- Nếu đã enroll rồi: status 200, message có thể "You are already enrolled...".
- **Lấy gì:** `data.enrollmentId`, `data.courseId` để chuyển sang màn học / chi tiết khóa.

---

## 2. Danh sách khóa học của tôi (My Courses)

**Khi nào dùng:** Màn "Khóa học của tôi" / Dashboard student. Trả về các khóa đã mua (paid), kèm **itemsProgress**, **continueLesson**, **progress** %.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/enrollments/my-courses` |
| **Body** | Không |

**Response thành công (200):**

```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "enrollmentId": "...",
      "progress": 25,
      "completed": false,
      "lastUpdated": "...",
      "continueLesson": {
        "lessonId": "...",
        "title": "Tên bài",
        "order": 1
      },
      "itemsProgress": [
        {
          "itemId": "...",
          "itemType": "lesson",
          "status": "done",
          "watchedSeconds": 120,
          "duration": 300
        },
        {
          "itemId": "...",
          "itemType": "lesson",
          "status": "progress",
          "watchedSeconds": 0,
          "duration": 400
        },
        {
          "itemId": "...",
          "itemType": "quiz",
          "status": "open"
        }
      ],
      "course": {
        "_id": "...",
        "title": "...",
        "thumbnail": "...",
        "sections": [ ... ],
        "instructor": { ... },
        "category": { ... }
      }
    }
  ]
}
```

**Cách dùng:**

- **itemsProgress:** Mảng theo đúng thứ tự syllabus. Mỗi phần tử:
  - `itemType`: `"lesson"` | `"quiz"`
  - `status`: Lesson = `"lock"` | `"progress"` | `"done"`; Quiz = `"open"` | `"done"`
  - Lesson có thêm `watchedSeconds`, `duration` (giây).
- **continueLesson:** Bài nên học tiếp (lessonId, title, order) – dùng cho nút "Tiếp tục học".
- **progress:** Phần trăm hoàn thành khóa (0–100), chỉ tính theo lesson.
- Ghép `course.sections` với `itemsProgress` (match `itemId` với `sections[].items[].itemId`) để hiển thị lock/progress/done từng item.

---

## 3. Chi tiết khóa học (đã enroll) – Có itemsProgress

**Khi nào dùng:** Màn học trong khóa (syllabus + video/quiz). Chỉ dùng khi user **đã enroll** (đã mua/đăng ký). BE trả cả nội dung khóa và **itemsProgress** của enrollment đó.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/courses/:id` |
| **Params** | `id` = courseId |

**Response thành công (200):**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "...",
    "sections": [
      {
        "title": "Phần 1",
        "items": [
          { "itemId": "...", "itemType": "lesson", "title": "...", "orderIndex": 1 },
          { "itemId": "...", "itemType": "quiz", "title": "...", "orderIndex": 2 }
        ]
      }
    ]
  },
  "itemsProgress": [
    { "itemId": "...", "itemType": "lesson", "status": "progress", "watchedSeconds": 0, "duration": 120 },
    { "itemId": "...", "itemType": "quiz", "status": "open" }
  ]
}
```

- **Lấy gì:** `data` = thông tin khóa + sections (để render syllabus). `itemsProgress` = trạng thái từng item (lock/progress/done, open/done) và với lesson thì có `watchedSeconds`, `duration`.
- FE match `itemsProgress[].itemId` với `data.sections[].items[].itemId` để hiển thị icon/trạng thái và chặn mở lesson đang **lock** (hoặc gọi API kiểm tra quyền trước khi mở).

---

## 4. Đánh dấu hoàn thành lesson (Complete Lesson)

**Khi nào dùng:** Khi user bấm "Hoàn thành" / "Mark complete" (không dựa vào thời gian xem). BE sẽ set lesson đó = **done**, mở lesson tiếp theo = **progress**, cập nhật **progress** %.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/enrollments/:courseId/complete-lesson` |
| **Params** | `courseId` = ID khóa học |
| **Body** | `{ "lessonId": "<lessonId>" }` |

**Response thành công (200):**

```json
{
  "success": true,
  "progress": 35,
  "completed": false,
  "itemsProgress": [ ... ]
}
```

- **Truyền:** `lessonId` = `itemId` của lesson (ObjectId dạng string) trong `sections[].items[]` hoặc `itemsProgress`.
- **Lấy gì:** Cập nhật UI từ `itemsProgress` mới (lesson vừa done, lesson tiếp progress); dùng `progress` để cập nhật thanh % hoàn thành.

---

## 5. Heartbeat – Cộng dồn thời gian xem lesson

**Khi nào dùng:** Trong lúc user **đang xem video** lesson. FE gửi định kỳ (ví dụ mỗi **10 giây**) số giây **thực tế vừa xem** (không phải vị trí thanh trượt). Khi tổng thời gian xem ≥ **30% duration** của lesson, BE tự chuyển lesson sang **done** và mở lesson tiếp theo.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/enrollments/:courseId/heartbeat` |
| **Params** | `courseId` = ID khóa học |
| **Body** | `{ "lessonId": "<lessonId>", "watchedSecondsDelta": 10 }` |

**Ví dụ body:**

- Mỗi 10s: `{ "lessonId": "69b419c9e25bddc0c15f3946", "watchedSecondsDelta": 10 }`
- `watchedSecondsDelta` = số giây vừa xem trong khoảng vừa qua (tích lũy thật, không tính khi user tua nhanh).

**Response thành công (200):**

```json
{
  "success": true,
  "progress": 25,
  "completed": false,
  "itemsProgress": [ ... ]
}
```

- **Truyền:** `lessonId` = ID lesson đang xem; `watchedSecondsDelta` = số giây (number) vừa xem.
- **Lấy gì:** Có thể dùng `itemsProgress` mới để cập nhật trạng thái (vd lesson chuyển done sau khi đủ 30%) và `progress` để cập nhật %.

---

## 6. Đánh dấu đã làm quiz (Quiz Done)

**Khi nào dùng:** Khi user **bắt đầu làm** hoặc **nộp** một quiz. BE set item quiz đó = **done** (chỉ để hiển thị/điều khiển, quiz luôn mở không lock).

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/enrollments/:courseId/quiz-done` |
| **Params** | `courseId` = ID khóa học |
| **Body** | `{ "quizId": "<quizId>" }` |

**Response thành công (200):**

```json
{
  "success": true,
  "itemsProgress": [ ... ]
}
```

- **Truyền:** `quizId` = `itemId` của quiz (trong `sections[].items[]` hoặc `itemsProgress`, `itemType === "quiz"`).
- **Lấy gì:** Cập nhật UI từ `itemsProgress` (quiz đó status = "done").

---

## 7. Kiểm tra quyền xem lesson (Lesson Access)

**Khi nào dùng:** Trước khi mở/xem một lesson (vd trước khi load video). Nếu lesson đang **lock** (chưa hoàn thành lesson trước), BE trả **403**; nếu được xem thì 200.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/enrollments/:courseId/lesson/:lessonId/access` |
| **Params** | `courseId`, `lessonId` |

**Response được phép (200):**

```json
{
  "success": true,
  "allowed": true,
  "status": "progress"
}
```

**Response bị chặn (403):**

```json
{
  "success": false,
  "allowed": false,
  "message": "Hoàn thành bài trước để mở khóa."
}
```

- **Truyền:** `courseId` trong path, `lessonId` trong path (ID lesson cần kiểm tra).
- **Lấy gì:** Nếu 200 → cho mở lesson; nếu 403 → hiển thị message, không cho xem video.

---

## Tóm tắt luồng FE gợi ý

1. **Enroll:** Gọi **POST /api/enrollments/enroll-free** với `courseId` → sau đó có thể vào màn học.
2. **Vào "Khóa của tôi":** **GET /api/enrollments/my-courses** → dùng `itemsProgress` + `continueLesson` + `progress` để hiển thị và nút "Tiếp tục".
3. **Vào màn học trong khóa:** **GET /api/courses/:id** → dùng `data.sections` + `itemsProgress` để render syllabus (lock/progress/done, open/done).
4. **Trước khi mở một lesson:** **GET .../lesson/:lessonId/access** → 403 thì không cho xem, hiện message.
5. **Đang xem video:** Gửi **POST .../heartbeat** mỗi ~10s với `lessonId` + `watchedSecondsDelta` (số giây vừa xem).
6. **Bấm "Hoàn thành lesson":** **POST .../complete-lesson** với `lessonId`.
7. **Sau khi làm/nộp quiz:** **POST .../quiz-done** với `quizId`.

---

## Lưu ý response lỗi

Mọi API lỗi (4xx, 5xx) đều có dạng:

```json
{
  "success": false,
  "message": "..."
}
```

FE nên kiểm tra `success === false` và hiển thị `message`. Các API enroll/lesson đều gắn với **courseId** và user đã **enroll**; nếu chưa mua khóa thì GET course hoặc các route `/:courseId/...` có thể trả 403.
