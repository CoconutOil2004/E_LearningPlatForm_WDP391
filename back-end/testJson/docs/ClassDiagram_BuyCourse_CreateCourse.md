# Class Diagram & Sequence – Buy Course & Create Course

Xác định **các class tham gia** và **ánh xạ** User → UI → Route → Controller → DB. Các hàm đề xuất; code có thể chỉnh sau cho khớp.

---

## 1. Danh sách Model (DB)

| Model | Thuộc tính chính |
|-------|------------------|
| User | _id, email, fullname, role |
| Course | _id, title, price, category, instructorId, sections |
| Category | _id, name, slug |
| Enrollment | _id, userId, courseId, paymentStatus, progress |
| Payment | _id, enrollmentId, amount, paymentMethod, status |
| Lesson | _id, title, videoUrl, courseId |
| Quiz | _id, title, courseId, questions |

Quan hệ: User 1–n Enrollment, Course 1–n Enrollment, Enrollment 1–n Payment, Category 1–n Course, User 1–n Course, Course 1–n Lesson, Course 1–n Quiz.    

---

## 2. Buy Course

### 2.1 Các class tham gia (Class Diagram + Sequence)

| Class | Vai trò |
|-------|--------|
| **Student** | Actor |
| **PaymentPage** (WebUI) | Trang mua khóa. Hàm: `buyCourse(courseId, paymentMethod)`, `showPaymentUrl(url)`, `showCourseNotFound()`, `showAlreadyEnrolled()`, `showPaymentFailed()`, `showPaymentSuccess()`, `showSystemError()` |
| **paymentRoutes** | POST /create → createPayment; GET /callback → paymentCallback |
| **paymentController** | `createPayment(req, res)`, `paymentCallback(req, res)` |
| **Course** | Model. findById() |
| **Enrollment** | Model. findOne(), create(), findById(), save() |
| **Payment** | Model. create(), findById(), save() |
| **Payment Gateway** | External. Redirect + callback GET /api/payments/callback |

### 2.2 Ánh xạ: User → UI → Route → Controller → DB

| | |
|---|-----|
| **User làm gì với UI** | Click "Mua khóa" trên trang chi tiết khóa (đã có courseId; có thể chọn paymentMethod). |
| **UI gọi** | `buyCourse(courseId, paymentMethod)` → gửi **POST /api/payments/create** (body: courseId, paymentMethod; header: Bearer token). |
| **Route** | `paymentRoutes`: `router.post("/create", protect, createPayment)` (mount `/api/payments`) ⇒ **POST /api/payments/create**. |
| **Controller** | `paymentController.createPayment(req, res)`. |
| **Controller gọi DB** | **Course**.findById(courseId) → **Enrollment**.findOne(…) → **Enrollment**.create(…) → **Payment**.create(…) → res.json({ paymentUrl }). Callback: **Payment**.findById, save; **Enrollment**.findById, save. |

### 2.3 Sequence (vẽ diagram)

| Từ | Tới | Message |
|----|-----|---------|
| Student | PaymentPage | clickBuyCourse(courseId, paymentMethod) |
| PaymentPage | paymentRoutes | POST /api/payments/create |
| paymentRoutes | paymentController | createPayment(req, res) |
| paymentController | Course | findById(courseId) |
| Course | paymentController | course \| null |
| paymentController | Enrollment | findOne(…); [alt] create(…) |
| paymentController | Payment | create(…) |
| paymentController | PaymentPage | 200 { paymentUrl } \| 404 \| 400 |
| PaymentPage | Student | showPaymentUrl \| showCourseNotFound \| showAlreadyEnrolled |
| *Callback:* paymentRoutes | paymentController | paymentCallback(req, res) |
| paymentController | Payment, Enrollment | findById, save() |

---

## 3. Create Course

### 3.1 Các class tham gia (Class Diagram + Sequence)

| Class | Vai trò |
|-------|--------|
| **Instructor** | Actor |
| **CreateCoursePage** (WebUI) | Trang tạo khóa. Hàm: `createCourse(payload)`, `updateCourse(courseId, payload)`, `uploadVideo(file)`, `uploadImages(files)` (gọi /api/upload), `showValidationError()`, … |
| **courseRoutes** | POST / → createCourse; PUT /:courseId → updateCourse (upload ảnh/video qua /api/upload) |
| **uploadRoutes** | POST /images → uploadImages; POST /video → uploadVideo (Cloudinary) |
| **courseController** | `createCourse(req, res)`, `updateCourse(req, res)` |
| **uploadController** | `uploadImages(req, res)`, `uploadVideo(req, res)` |
| **Course** | Model. create(), findById(), save() |
| **Category** | Model. validateCategoryId (find/validate) |
| **User** | instructorId từ req.user (token) |
| **Lesson** | Model. (updateCourse) create(), save() |
| **Quiz** | Model. (updateCourse) create(), save() |
| **Cloudary** | External. upload → videoUrl, publicId, duration |

### 3.2 Ánh xạ: User → UI → Route → Controller → DB

| | |
|---|-----|
| **User làm gì với UI** | Vào trang tạo khóa, điền form (title, description, categoryId, level), click "Tạo khóa học". |
| **UI gọi** | `createCourse({ title, description, categoryId, level })` → **POST /api/courses** (body + Bearer token). |
| **Route** | `courseRoutes`: `router.post("/", protect, authorize("instructor"), createCourse)` (mount `/api/courses`) ⇒ **POST /api/courses**. |
| **Controller** | `courseController.createCourse(req, res)`. |
| **Controller gọi DB** | Validate → **Category**.validateCategoryId(categoryId) → **Course**.create(…) → **Course**.findById().populate() → res.status(201).json(data). |

### 3.3 Sequence (vẽ diagram)

| Từ | Tới | Message |
|----|-----|---------|
| Instructor | CreateCoursePage | submitCreateCourse(title, description, categoryId, level) |
| CreateCoursePage | courseRoutes | POST /api/courses |
| courseRoutes | courseController | createCourse(req, res) |
| courseController | courseController | validate(title, categoryId, level) |
| courseController | Category | validateCategoryId(categoryId) |
| Category | courseController | valid \| error |
| courseController | Course | create(…); findById().populate() |
| Course | courseController | course, populated |
| courseController | CreateCoursePage | 201 { data } \| 400 showValidationError |

---

## 4. Tóm tắt

- **Mount:** `app.use("/api/payments", paymentRoutes)` → POST /api/payments/create, GET /api/payments/callback. `app.use("/api/courses", courseRoutes)` → POST /api/courses, PUT /api/courses/:courseId, POST /api/courses/upload-video.
- **Không có Service:** Controller gọi trực tiếp Model. Tên hàm/class trong tài liệu là đề xuất; chỉnh code sau cho khớp.
