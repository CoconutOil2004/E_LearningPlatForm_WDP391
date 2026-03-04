const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  register,
  login,
  verifyOTP,
  resendOTP,
  googleCallback,
  forgotPassword,
  getProfile,
  updateProfile,
  updatePassword,
} = require("../controller/authController");

const { protect } = require("../middleware/authMiddleware");

// Auth thường
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);

// Google OAuth — bước 1: redirect sang Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err) {
      console.error("❌ Google OAuth error:", err);
      return res.redirect(
        `${process.env.CLIENT_URL}/signin?error=${encodeURIComponent(err.message || "google_failed")}`,
      );
    }
    if (!user) {
      console.error("❌ Google OAuth no user:", info);
      return res.redirect(
        `${process.env.CLIENT_URL}/signin?error=google_failed`,
      );
    }
    // Gắn user vào req rồi gọi controller
    req.user = user;
    return googleCallback(req, res, next);
  })(req, res, next);
});

// Profile (cần auth)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

module.exports = router;
