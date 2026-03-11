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
} = require("../controller/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.put("/change-password-required", protect, changePasswordRequired);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/signin?error=google_failed`,
  }),
  googleCallback,
);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

module.exports = router;