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
  changePasswordRequired,
  verifyResetPasswordToken,
  resetPassword,
  logout,
  refreshToken,
} = require("../controller/authController");

const { protect } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.get("/verify-reset-password", verifyResetPasswordToken);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.post("/refresh-token", protect, refreshToken);
router.put("/change-password-required", protect, changePasswordRequired);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  }),
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    console.log("GOOGLE CALLBACK ERR:", err);
    console.log("GOOGLE CALLBACK USER:", user);
    console.log("GOOGLE CALLBACK INFO:", info);

    if (err) {
      return res.redirect(
        `${process.env.CLIENT_URL}/signin?error=${encodeURIComponent(err.message || "google_failed")}`,
      );
    }

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/signin?error=google_failed`,
      );
    }

    req.user = user;
    return googleCallback(req, res, next);
  })(req, res, next);
});

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

module.exports = router;
