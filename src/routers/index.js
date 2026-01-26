const express = require("express");

// THÊM: Import Notification Router
const notificationRouter = require("./notificationRouter");

const { authMiddleware } = require("../middleware/auth.middleware");
const {
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
  chatbotLimiter
} = require("../middleware/rateLimiter.middleware");
const passport = require("passport");

router.use("/admin", adminRouter);
// THÊM: Route cho Thông báo
router.use('/notifications', notificationRouter);

// Routes cho đăng ký và xác thực email - áp dụng rate limiting nghiêm ngặt
router.post("/register", authLimiter, authController.register); // Đăng ký
router.post("/verify-otp", otpLimiter, authController.verifyOTP);
router.post("/resend-otp", otpLimiter, authController.resendOTP);     // (Tuỳ chọn) Gửi lại OTP nếu hết hạn

// Routes đăng nhập và quên mật khẩu - áp dụng rate limiting nghiêm ngặt
router.post("/login", authLimiter, authController.login);

// Google Login
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback
);


router.post("/forgot-password", passwordResetLimiter, authController.forgotPassword); // Quên mật khẩu

// User profile routes
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/profile/password", authMiddleware, authController.updatePassword);

// User search routes
router.get("/users/search", authMiddleware, userController.searchUsers);
router.get("/users/:id", authMiddleware, userController.getUserById);

router.use("/images", authMiddleware, imageRoutes);

module.exports = router;