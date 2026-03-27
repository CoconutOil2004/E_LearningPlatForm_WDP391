# Phân Tích Chi Tiết Luồng Hệ Thống (E-Learning Platform)

---

## 1. Luồng Đăng nhập Google OAuth

### 1.1 Tổng quan mục đích
Thay vì người dùng phải nhớ tài khoản/mật khẩu riêng, hệ thống ủy quyền việc xác thực danh tính cho Google thông qua giao thức OAuth 2.0. Sau khi Google xác nhận danh tính, backend tự cấp phát JWT Token riêng của hệ thống.

### 1.2 Cấu hình & Biến môi trường (`.env`)
```
GOOGLE_CLIENT_ID=...       # Mã định danh ứng dụng Google
GOOGLE_CLIENT_SECRET=...   # Mật khẩu bí mật của ứng dụng Google
GOOGLE_CALLBACK_URL=...    # URL backend nhận callback từ Google
CLIENT_URL=...             # URL frontend để redirect sau đăng nhập
JWT_SECRET=...             # Khóa để ký JWT Token
```

### 1.3 Database Schema — `User.js`
| Trường | Kiểu | Mô tả |
|---|---|---|
| `googleId` | String | ID duy nhất do Google cấp. `sparse: true` cho phép null (user thường) nhưng unique khi có giá trị |
| `username` | String | **Chỉ bắt buộc nếu không có `googleId`**. Khi đăng nhập Google lần đầu được tự sinh: `email.split('@')[0] + '_' + Date.now()` |
| `password` | String | **Chỉ bắt buộc nếu không có `googleId`**. Tài khoản Google không cần mật khẩu |
| `isVerified` | Boolean | Google login tự đặt thành `true`, bỏ qua bước xác thực OTP |
| `mustChangePassword` | Boolean | Google login tự đặt thành `false`, không bao giờ bắt đổi pass |
| `action` | Enum | `'lock'` hoặc `'unlock'`. Nếu `lock`, mọi luồng đều bị chặn |

**Quan trọng — `pre('save')` hook:**
```js
// User.js - dòng 68-79
userSchema.pre("save", async function (next) {
  // CHỈ băm khi trường password thực sự thay đổi
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10); // Tạo salt ngẫu nhiên 10 rounds
  this.password = await bcrypt.hash(this.password, salt); // Băm 1 chiều
  next();
});
```
> Đây là lý do tại sao code ở controller chỉ cần gán `user.password = newPassword` mà không cần tự gọi bcrypt — mọi thứ được tự động hóa ở Model.

### 1.4 API Endpoints — `authRoutes.js`
```
GET /api/auth/google
  → Middleware: passport.authenticate("google", { scope: ["profile", "email"], session: false })
  → Redirect người dùng đến trang đăng nhập của Google

GET /api/auth/google/callback
  → Google redirect về đây sau khi xác thực
  → Middleware: passport.authenticate() xử lý callback
  → Gọi: googleCallback (authController)
```

### 1.5 Luồng xử lý chi tiết

**Bước 1: Người dùng nhấn "Đăng nhập Google" → `GET /api/auth/google`**
- Hệ thống yêu cầu quyền truy cập `profile` (tên, ảnh) và `email`.
- `session: false` → Hệ thống dùng JWT chứ không dùng session server-side.
- `prompt: "select_account"` → Buộc Google luôn hiện màn hình chọn tài khoản.

**Bước 2: Google redirect về `GET /api/auth/google/callback` → `passport.js`**
```js
// passport.js - Verify Callback
async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value?.toLowerCase();
  if (!email) return done(new Error("Google account does not provide email"), null);

  // Tra trước bằng googleId (nhanh hơn)
  let user = await User.findOne({ googleId: profile.id });

  if (!user) {
    // Không tìm thấy bằng googleId, thử tìm bằng email
    user = await User.findOne({ email });

    if (user) {
      // TH1: Email đã tồn tại → Liên kết tài khoản cũ với Google
      if (user.action === "lock") return done(new Error("Tài khoản bị khóa"), null);
      user.googleId = profile.id;      // Gắn Google ID vào tài khoản cũ
      user.isVerified = true;           // Bỏ qua yêu cầu OTP
      user.mustChangePassword = false;  // Bỏ yêu cầu đổi mật khẩu
      // Vá các thông tin trống nếu có
      if (!user.username) user.username = email.split("@")[0] + "_" + Date.now();
      await user.save();
    } else {
      // TH2: Chưa có tài khoản nào → Tạo mới
      user = await User.create({
        googleId: profile.id, email,
        fullname: profile.displayName,
        username: email.split("@")[0] + "_" + Date.now(),
        avatarURL: profile.photos?.[0]?.value,
        role: "student",     // Mặc định là học viên
        isVerified: true,    // Bỏ qua OTP
        mustChangePassword: false,
      });
    }
  } else {
    // TH3: Đã tìm thấy bằng googleId → Đăng nhập lại
    if (user.action === "lock") return done(new Error("Tài khoản bị khóa"), null);
    // Cập nhật thông tin trống nếu có (fullname, avatar, username)
    if (user.isModified) await user.save();
  }
  return done(null, user); // Trả user về cho Express
}
```

**Bước 3: Cấp JWT Token → `authController.js` (`googleCallback`)**
```js
// authController.js - dòng 335-372
exports.googleCallback = async (req, res) => {
  const user = req.user; // Đã được Passport nhét vào req
  if (!user) return res.redirect(`${CLIENT_URL}/signin?error=google_failed`);

  // Ký JWT Token thời hạn 1 ngày
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Encode thông tin user thành URL-safe string
  const userData = encodeURIComponent(JSON.stringify({ id, username, fullname, email, avatarURL, role, mustChangePassword }));

  // Redirect về Frontend kèm token và user data trên URL
  return res.redirect(`${CLIENT_URL}/auth/callback?token=${token}&user=${userData}`);
};
```
> Frontend tại `/auth/callback` sẽ giải mã URL, lưu token vào LocalStorage/Cookie và chuyển người dùng đến trang chính.

### 1.6 Sơ đồ luồng
```
[User] --> [Nhấn "Đăng nhập Google"]
   → GET /api/auth/google (Backend redirect sang Google)
   → [Google xác thực người dùng]
   → GET /api/auth/google/callback (Google gọi lại Backend)
   → [passport.js] kiểm tra DB, tạo/cập nhật User
   → [authController.googleCallback] tạo JWT Token
   → res.redirect("CLIENT_URL/auth/callback?token=...&user=...")
   → [Frontend] lưu token, đăng nhập thành công
```

---

## 2. Luồng Quên Mật Khẩu (Forgot Password)

### 2.1 Tổng quan mục đích
Hệ thống sinh một mật khẩu ngẫu nhiên dài 10 ký tự gửi qua email. Người dùng đăng nhập bằng mật khẩu tạm thời này và bị buộc phải đổi sang mật khẩu tự chọn ngay lập tức trước khi được sử dụng nền tảng.

### 2.2 Cấu hình & Biến môi trường (`.env`)
```
EMAIL_USER=...  # Địa chỉ Gmail dùng để gửi mail
EMAIL_PASS=...  # App Password của Gmail (không phải password tài khoản)
```

### 2.3 Database Schema — Trường liên quan trong `User.js`
| Trường | Kiểu | Mô tả |
|---|---|---|
| `password` | String | Bị ghi đè bằng mật khẩu tạm mới. Pre-save hook tự bcrypt |
| `mustChangePassword` | Boolean | Khi `true`, Frontend bắt buộc người dùng phải đổi mật khẩu |
| `resetPasswordToken` | String | Trường này tồn tại nhưng hiện tại không được sử dụng trong luồng `forgotPassword` |

### 2.4 API Endpoints — `authRoutes.js`
```
POST /api/auth/forgot-password
  → Validation: forgotPasswordValidation (kiểm định dạng email)
  → Controller: forgotPassword

PUT /api/auth/change-password-required     [Protected - cần JWT]
  → Middleware: protect (xác thực JWT)
  → Controller: changePasswordRequired
```

### 2.5 Module Gửi Email — `utils/email.js` & `services/emailService.js`
```js
// utils/email.js
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});
```

### 2.6 Luồng xử lý chi tiết

**Bước 1: User gửi email → `POST /api/auth/forgot-password`**
```js
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

  const newPassword = generateRandomPassword(10); // VD: "aB3#kR9mZq"

  user.password = newPassword;           // Model tự bcrypt khi save()
  user.mustChangePassword = true;        // Bật cờ chặn
  user.resetPasswordToken = undefined;   // Xóa token cũ nếu có
  await user.save();

  // Gửi mail HTML đẹp chứa newPassword
  await sendEmail({ to: email, subject: "Reset Password", html: template });
};
```

**Bước 2: User đăng nhập với mật khẩu tạm → `POST /api/auth/login`**
- Hàm `user.comparePassword(password)` gọi `bcrypt.compare(candidate, hash)`.
- Nếu khớp, API trả về `token` kèm `mustChangePassword: true`.
- **Frontend đọc cờ này** → Khóa điều hướng, redirect người dùng đến màn hình đổi mật khẩu bắt buộc.

**Bước 3: User đổi mật khẩu mới → `PUT /api/auth/change-password-required`**
```js
exports.changePasswordRequired = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validation chuỗi
  if (newPassword !== confirmPassword) return res.status(400)...
  if (currentPassword === newPassword) return res.status(400)... // Không cho đổi y chang cũ

  const user = await User.findById(req.user.id);
  if (!user.mustChangePassword) return res.status(400)... // Chặn người không trong luồng này

  // So khớp mật khẩu tạm (bcrypt.compare)
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(400)...

  user.password = newPassword;       // Gán mật khẩu mới (Model tự hash)
  user.mustChangePassword = false;   // Tháo khóa, trả lại quyền bình thường
  await user.save();
};
```

### 2.7 Sơ đồ luồng
```
[User] --> POST /api/auth/forgot-password (nhập email)
   → [Controller] tìm user, sinh newPassword(10 ký tự ngẫu nhiên)
   → [Model pre-save] bcrypt.hash(newPassword) → lưu DB
   → [Nodemailer] gửi email HTML chứa mật khẩu tạm
   → [User] nhận email → Đăng nhập bằng mật khẩu tạm
   → [Login API] trả về token + mustChangePassword: true
   → [Frontend] phát hiện cờ → Bắt buộc vào màn đổi mật khẩu
   → PUT /api/auth/change-password-required
   → [Controller] Xác nhận mật khẩu cũ, đổi mật khẩu mới, tắt cờ
   → [User] Đăng nhập bình thường
```

---

## 3. Luồng Thông Báo (Notification System)

### 3.1 Tổng quan mục đích
Hệ thống thông báo là một hệ thống đơn giản theo mô hình **Pull** (người dùng chủ động gọi API để lấy). Mỗi thông báo gắn với 1 user, có trạng thái đọc/chưa đọc cùng đường link tùy chọn.

### 3.2 Database Schema — `Notification.js`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `user` | ObjectId (ref: User) | ✅ | Chủ sở hữu thông báo. Có `index: true` để query nhanh |
| `title` | String | ✅ | Tiêu đề thông báo |
| `message` | String | ✅ | Nội dung chi tiết |
| `type` | Enum | | `"info"`, `"success"`, `"warning"`, `"error"` |
| `isRead` | Boolean | | Mặc định `false`. Thay đổi thành `true` khi người dùng đọc |

### 3.3 API Endpoints — `notificationRoutes.js`
```
GET  /api/notifications/              → getNotifications (Lấy danh sách)
PATCH /api/notifications/:id/read    → markOneAsRead (Đánh dấu 1 thông báo đã đọc)
POST /api/notifications/mark-all-read → markAllAsRead (Đánh dấu tất cả đã đọc)
```

### 3.4 Chi tiết từng Handler

**Handler 1 — `getNotifications`: Lấy danh sách**
```js
exports.getNotifications = async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification
    .find({ user: userId })     // Chỉ lấy thông báo của chính userId này
    .sort({ createdAt: -1 })    // Mới nhất lên đầu
    .limit(50);                 
  res.status(200).json({ success: true, notifications });
};
```

---

## 4. Luồng Quản Lý Doanh Thu (Revenue Management)

### 4.1 Tổng quan mục đích và Cải tiến
Phân tích sức khỏe tài chính của nền tảng và của cá nhân giảng viên. 
**Quan trọng**: Hệ thống đã được chuyển đổi từ việc truy vấn bảng `Order` sang bảng `Payment`. Đây là "Nguồn sự thật duy nhất" (Source of Truth) vì nó lưu kết quả trực tiếp từ VNPay.

### 4.2 Database Schema — `Payment.js`
| Trường | Kiểu | Mô tả |
|---|---|---|
| `enrollmentId` | ObjectId | Liên kết tới bản ghi đăng ký khóa học |
| `amount` | Number | Số tiền thực tế người dùng đã trả |
| `status` | Enum | `"success"` (mới được tính doanh thu), `"pending"`, `"failed"` |
| `transactionId` | String | Mã giao dịch khớp với VNPay |

### 4.3 API Endpoints — `analyticsRoutes.js` / `userRoutes.js`
```
GET /api/analytics/instructor
  → Controller: getInstructorAnalytics (Tính doanh thu Dashboard)

GET /api/user/instructor/revenue
  → Controller: getInstructorRevenue (Dùng cho trang Tài chính chi tiết)
```

### 4.4 Luồng xử lý chi tiết (Instructor Revenue Fix)
```js
// analyticsController.js - getInstructorAnalytics
// Join bảng Payment -> Enrollment để lọc theo khóa học của Instructor
const revenueResult = await Payment.aggregate([
  { $match: { status: 'success' } }, // CHỈ tính các giao dịch thành công
  {
    $lookup: {
      from: 'enrollments',
      localField: 'enrollmentId',
      foreignField: '_id',
      as: 'enrollment'
    }
  },
  { $unwind: '$enrollment' },
  { $match: { 'enrollment.courseId': { $in: courseIds } } }, // Lọc theo danh sách khóa học của GIẢNG VIÊN
  { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
]);
```

---

## 5. Luồng Quản Lý Học Viên (Instructor Students)

### 5.1 Tổng quan mục đích
Instructor theo dõi toàn bộ danh sách sinh viên đã mua khóa học của mình, kèm theo tiến độ học tập thực tế và thông tin liên lạc.

### 5.2 Database Schema — `Enrollment.js`
| Trường | Kiểu | Mô tả |
|---|---|---|
| `userId` | ObjectId | ID của sinh viên (ref: User) |
| `courseId` | ObjectId | ID khóa học (ref: Course) |
| `progress` | Number | % hoàn thành bài giảng (0-100) |
| `completed` | Boolean | True nếu đã học hết các bài giảng bắt buộc |

### 5.3 API Endpoints — `userRoutes.js`
```
GET /api/user/instructor/students (Protected - Instructor Only)
  → Controller: getInstructorStudents
```

### 5.4 Luồng xử lý chi tiết
Hệ thống thực hiện nối 3 bảng (User, Course, Enrollment) để lấy dữ liệu tổng hợp.
```js
// userController.js - getInstructorStudents
exports.getInstructorStudents = async (req, res) => {
  const instructorId = req.user.id;
  
  // 1. Phải lấy mảng CourseId mà ông này sở hữu
  const myCourses = await Course.find({ instructorId }).select('_id');
  const courseIds = myCourses.map(c => c._id);

  // 2. Chuyển sang Aggregation để lấy thông tin Student lồng nhau
  const students = await Enrollment.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    { $project: { progress: 1, 'student.fullname': 1, 'student.email': 1 } }
  ]);
  res.json({ success: true, data: students });
};
```

---

## 6. Luồng Quản Lý Blog & Kiểm Duyệt (Admin Moderation)

### 6.1 Tổng quan mục đích
Kiểm soát chất lượng nội dung công cộng. Mọi bài viết (trừ bản nháp) đều phải qua tay Admin phê duyệt trước khi xuất hiện trên giao diện người dùng cuối.

### 6.2 Database Schema — `Blog.js`
| Trường | Kiểu | Mô tả |
|---|---|---|
| `author` | ObjectId | Giảng viên viết bài |
| `status` | Enum | `"draft"`, `"pending"`, `"approved"`, `"rejected"` |
| `rejectedReason`| String | Lý do từ chối (Admin nhập vào khi reject) |
| `deleted` | Boolean | Cờ xóa mềm (Soft delete) |

### 6.3 API Endpoints — `blogRoutes.js`
```
GET /api/blog/admin/manage (Admin Only)
  → Lấy toàn bộ blog đang chờ duyệt

PATCH /api/blog/admin/:id/approve
  → Đổi trạng thái sang 'approved'

PATCH /api/blog/admin/:id/reject
  → Đổi trạng thái sang 'rejected' kèm lý do
```

### 6.4 Luồng xử lý chi tiết (Admin Approval)
```js
// blogController.js - approveBlog
exports.approveBlog = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findByIdAndUpdate(
    id, 
    { 
      status: 'approved', 
      approvedBy: req.user.id,
      approvedAt: new Date() 
    }, 
    { new: true }
  );
  // Sau lệnh này, bài viết sẽ tự động xuất hiện trên trang Public Blog
};
```

---

### *KẾT LUẬN*
Hệ thống EduFlow duy trì tính nhất quán của dữ liệu thông qua cơ sở dữ liệu MongoDB được thiết kế theo quan hệ chặt chẽ giữa các thành phần. Việc sử dụng mã nguồn rõ ràng kèm theo các bảng đặc tả Schema giúp đội ngũ phát triển dễ dàng mở rộng và bảo trì các tính năng quan trọng như Thanh toán, Học tập và Kiểm duyệt nội dung.
