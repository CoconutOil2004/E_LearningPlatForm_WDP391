# Kiểm tra Model ↔ API (Course)

Đối chiếu schema Mongoose với payload/response của API course.

---

## 1. Course (models/Course.js)

| Model field      | Type        | API createCourse (body) | API updateCourse (body) | Response (getCourseById, search) |
|------------------|-------------|--------------------------|--------------------------|-----------------------------------|
| courseId         | String      | — (BE tự sinh)           | —                        | ✓                                 |
| title            | String, max 60 | **title** (bắt buộc)  | title (optional)         | ✓                                 |
| description      | String      | description (optional)  | description (optional)   | ✓                                 |
| price            | Number, ≥0  | — (mặc định 0)           | price (optional)         | ✓                                 |
| status           | enum        | — (mặc định "draft")     | status (optional)        | ✓                                 |
| thumbnail        | String      | —                        | —                        | ✓                                 |
| category         | ObjectId→Category | **categoryId** (body) | categoryId (optional)   | ✓ populate name, slug, description |
| level            | enum        | **level** (bắt buộc)     | level (optional)         | ✓                                 |
| language         | String      | —                        | —                        | ✓ (default "none")                 |
| rating           | Number      | —                        | —                        | ✓                                 |
| enrollmentCount  | Number      | —                        | —                        | ✓                                 |
| totalDuration    | Number      | —                        | —                        | ✓                                 |
| instructorId     | ObjectId→User | — (req.user._id)       | —                        | ✓ populate fullname, email        |
| sections         | [sectionSchema] | — (curriculum API)   | —                        | ✓                                 |

**Level enum:** `["Beginner", "Intermediate", "Advanced"]` (trùng Course schema).

---

## 2. Section (embedded trong Course.sections)

| Model field | Type   | API addSection (body) | API updateSection (body) | Response (getCurriculum) |
|-------------|--------|------------------------|---------------------------|---------------------------|
| title       | String | **title** (bắt buộc)   | **title** (bắt buộc)      | ✓                         |
| items       | [sectionItemSchema] | — (mặc định []) | —                  | ✓                         |

---

## 3. Section Item (sections[].items[])

| Model field | Type     | API addLesson / addQuiz ghi vào item | Response (getCurriculum) |
|-------------|----------|--------------------------------------|---------------------------|
| itemType    | "lesson" \| "quiz" | ✓ (BE set)                    | ✓                         |
| itemRef     | "Lesson" \| "Quiz" | ✓ (BE set)                   | ✓                         |
| itemId      | ObjectId (refPath) | lesson._id / quiz._id       | ✓ populate (Lesson hoặc Quiz) |
| title       | String   | body.title hoặc mặc định             | ✓                         |
| orderIndex  | Number   | BE tính = items.length + 1            | ✓                         |

---

## 4. Lesson (models/Lesson.js)

| Model field   | Type    | API addLesson (body/form) | Response (getCurriculum, getCourseLessons) |
|---------------|---------|----------------------------|--------------------------------------------|
| title         | String  | title (optional)           | ✓                                           |
| videoUrl      | String  | — (BE từ Cloudinary)       | ✓                                           |
| videoPublicId | String  | — (BE từ Cloudinary)       | — (không trả ra FE)                         |
| duration      | Number  | — (BE từ Cloudinary)       | ✓ (giây)                                    |
| courseId      | ObjectId| — (BE = course._id)        | —                                           |

---

## 5. Quiz (models/Quiz.js)

| Model field | Type   | API addQuiz (body) | Response (getCurriculum) |
|-------------|--------|--------------------|--------------------------|
| title       | String | title (optional)   | ✓                        |
| courseId    | ObjectId | — (BE = course._id) | —                      |
| questions   | [questionSchema] | **questions** (array) | ✓ (populate)        |

**questionSchema:** `text` (String, required), `options` ([String], min 2), `correctAnswer` (String, required).

---

## 6. Category (models/Category.js)

Chỉ dùng trong Course: **categoryId** (body) phải là ObjectId tồn tại trong Category. Response populate: `name`, `slug`, `description`.

---

## Kết luận

- **Request body/params** của từng API khớp với field trong model (tên trường, kiểu, bắt buộc/tùy chọn).
- **Response** dùng đúng ref (Category, User) và populate đúng field (fullname, email, name, slug, description).
- **Enum** level/status dùng trùng với schema; Quiz questions khớp questionSchema (text, options, correctAnswer).
