const User = require("../models/User");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { sendNotification } = require("../utils/notificationUtils");
const { sendEmail } = require("../services/emailService");
const crypto = require("crypto");
const { generateRandomPassword } = require("../utils/password");

// Email format validation helper
const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// ================= EMAIL TEMPLATES =================
const buildOtpEmailTemplate = (fullname, otp) => {
  return {
    text: `Hello ${fullname || "there"},
Your OTP code is: ${otp}
This code will expire in 10 minutes.`,

    html: `
      <div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:40px 0;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          <div style="background:#4f46e5; color:white; padding:20px; text-align:center;">
            <h2 style="margin:0;">E-Learning Platform</h2>
          </div>

          <div style="padding:30px; color:#333;">
            <h3 style="margin-top:0;">Hello ${fullname || "there"},</h3>

            <p>You are verifying your account.</p>
            <p>Here is your <strong>OTP code</strong>:</p>

            <div style="background:#f3f4f6; border:1px dashed #4f46e5; padding:15px; text-align:center; font-size:24px; font-weight:bold; letter-spacing:4px; margin:20px 0; border-radius:6px;">
              ${otp}
            </div>

            <p>This OTP code will expire in <strong>10 minutes</strong>.</p>

            <p style="color:#666; font-size:14px;">
              If you did not request this, please ignore this email.
            </p>
          </div>

          <div style="background:#f9fafb; text-align:center; padding:20px; font-size:13px; color:#888;">
            © ${new Date().getFullYear()} E-Learning Platform
            <br />
            This is an automated email, please do not reply.
          </div>
        </div>
      </div>
    `,
  };
};

const buildForgotPasswordTemplate = (fullname, newPassword) => {
  return {
    text: `Hello ${fullname || "there"},
Your temporary password is: ${newPassword}
Please log in using this password and change it immediately after logging in.`,

    html: `
      <div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:40px 0;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          <div style="background:#4f46e5; color:white; padding:20px; text-align:center;">
            <h2 style="margin:0;">E-Learning Platform</h2>
          </div>

          <div style="padding:30px; color:#333;">
            <h3 style="margin-top:0;">Hello ${fullname || "there"},</h3>

            <p>You have requested to reset your password.</p>
            <p>Here is your <strong>temporary password</strong>:</p>

            <div style="background:#f3f4f6; border:1px dashed #4f46e5; padding:15px; text-align:center; font-size:20px; font-weight:bold; letter-spacing:2px; margin:20px 0; border-radius:6px;">
              ${newPassword}
            </div>

            <p>
              Please log in with this password and
              <strong> change it immediately after logging in</strong>
              to ensure your account security.
            </p>

            <p style="color:#666; font-size:14px;">
              If you did not request a password reset, please ignore this email.
            </p>
          </div>

          <div style="background:#f9fafb; text-align:center; padding:20px; font-size:13px; color:#888;">
            © ${new Date().getFullYear()} E-Learning Platform
            <br />
            This is an automated email, please do not reply.
          </div>
        </div>
      </div>
    `,
  };
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      username,
      fullname,
      email,
      password,
      otp,
      otpExpires,
    });

    await user.save();

    const otpTemplate = buildOtpEmailTemplate(fullname, otp);

    await sendEmail({
      to: email,
      subject: "Registration OTP Code - E-Learning Platform",
      text: otpTemplate.text,
      html: otpTemplate.html,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the OTP",
      email,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Verification successful. You can now log in.",
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= RESEND OTP =================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const otpTemplate = buildOtpEmailTemplate(user.fullname, otp);

    await sendEmail({
      to: user.email,
      subject: "New OTP Code - E-Learning Platform",
      text: otpTemplate.text,
      html: otpTemplate.html,
    });

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Account is not verified. Please check your email for the OTP.",
        email: user.email,
      });
    }

    if (user.action === "lock") {
      return res.status(403).json({
        success: false,
        message: "Account is locked. Please contact administrator.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        avatarURL: user.avatarURL,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    logger.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= LOGIN BY GOOGLE =================
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/signin?error=google_failed`,
      );
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const userData = encodeURIComponent(
      JSON.stringify({
        id: user._id.toString(),
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        avatarURL: user.avatarURL,
        role: user.role,
        mustChangePassword: user.mustChangePassword || false,
      }),
    );

    return res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${userData}`,
    );
  } catch (err) {
    console.error("Google login error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL}/signin?error=google_login_failed`,
    );
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email là bắt buộc",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const newPassword = generateRandomPassword(10);

    user.password = newPassword;
    user.mustChangePassword = true;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const forgotTemplate = buildForgotPasswordTemplate(
      user.fullname,
      newPassword,
    );

    await sendEmail({
      to: user.email,
      subject: "Reset Password - E-Learning Platform",
      text: forgotTemplate.text,
      html: forgotTemplate.html,
    });

    return res.json({
      success: true,
      message: "A temporary password has been sent to your email",
    });
  } catch (error) {
    logger.error("ForgotPassword Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful. Please log in again.",
    });
  } catch (error) {
    logger.error("ResetPassword Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= VERIFY RESET TOKEN =================
exports.verifyResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    return res.json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    logger.error("verifyResetPasswordToken Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= CHANGE ROLE =================
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "New role is required",
      });
    }

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    user.role = role;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      success: true,
      message: `Role updated to ${role}`,
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    logger.error("Change role error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Error getting user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const { fullname, email, avatarURL } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email !== user.email) {
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      user.email = email;
    }

    if (req.body.username && req.body.username !== user.username) {
      const existingUsername = await User.findOne({
        username: req.body.username,
        _id: { $ne: user._id },
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already in use",
        });
      }
      user.username = req.body.username;
    }

    if (fullname) user.fullname = fullname;
    if (avatarURL) user.avatarURL = avatarURL;

    await user.save();
    const updatedUser = await User.findById(req.user.id).select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    logger.error("Error updating user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= UPDATE PASSWORD =================
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    logger.error("Error updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= CHANGE PASSWORD REQUIRED =================
exports.changePasswordRequired = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter current password, new password, and confirm password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation does not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as current password",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.mustChangePassword) {
      return res.status(400).json({
        success: false,
        message: "This account is not required to change password",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
      data: {
        mustChangePassword: false,
      },
    });
  } catch (error) {
    logger.error("Error changing required password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= REFRESH TOKEN =================
exports.refreshToken = async (req, res) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist",
      });
    }

    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      success: true,
      accessToken: newToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or has expired",
    });
  }
};
