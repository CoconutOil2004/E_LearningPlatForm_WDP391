const User = require("../models/User");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { sendEmail } = require("../services/emailService");
const crypto = require("crypto");
const { generateRandomPassword } = require("../utils/password");

// Hàm kiểm tra định dạng email
const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// ================= EMAIL TEMPLATES =================
const buildOtpEmailTemplate = (fullname, otp) => {
  return {
    text: `Xin chào ${fullname || "bạn"},
Mã OTP của bạn là: ${otp}
Mã này sẽ hết hạn sau 10 phút.`,

    html: `
      <div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:40px 0;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          <div style="background:#4f46e5; color:white; padding:20px; text-align:center;">
            <h2 style="margin:0;">E-Learning Platform</h2>
          </div>

          <div style="padding:30px; color:#333;">
            <h3 style="margin-top:0;">Xin chào ${fullname || "bạn"},</h3>

            <p>Bạn đang thực hiện xác thực tài khoản.</p>
            <p>Dưới đây là <strong>mã OTP</strong> của bạn:</p>

            <div style="background:#f3f4f6; border:1px dashed #4f46e5; padding:15px; text-align:center; font-size:24px; font-weight:bold; letter-spacing:4px; margin:20px 0; border-radius:6px;">
              ${otp}
            </div>

            <p>Mã OTP này sẽ hết hạn sau <strong>10 phút</strong>.</p>

            <p style="color:#666; font-size:14px;">
              Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
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
    text: `Xin chào ${fullname || "bạn"},
Mật khẩu tạm thời của bạn là: ${newPassword}
Vui lòng đăng nhập bằng mật khẩu này và đổi lại mật khẩu mới ngay sau khi đăng nhập.`,

    html: `
      <div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:40px 0;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          <div style="background:#4f46e5; color:white; padding:20px; text-align:center;">
            <h2 style="margin:0;">E-Learning Platform</h2>
          </div>

          <div style="padding:30px; color:#333;">
            <h3 style="margin-top:0;">Xin chào ${fullname || "bạn"},</h3>

            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
            <p>Dưới đây là <strong>mật khẩu tạm thời</strong> của bạn:</p>

            <div style="background:#f3f4f6; border:1px dashed #4f46e5; padding:15px; text-align:center; font-size:20px; font-weight:bold; letter-spacing:2px; margin:20px 0; border-radius:6px;">
              ${newPassword}
            </div>

            <p>
              Vui lòng đăng nhập bằng mật khẩu này và
              <strong> đổi lại mật khẩu mới ngay sau khi đăng nhập</strong>
              để đảm bảo an toàn cho tài khoản của bạn.
            </p>

            <p style="color:#666; font-size:14px;">
              Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
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

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc username đã tồn tại",
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
      subject: "Mã OTP đăng ký - E-Learning Platform",
      text: otpTemplate.text,
      html: otpTemplate.html,
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công. Vui lòng kiểm tra email để nhập OTP",
      email,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
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
        message: "Email và OTP là bắt buộc",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản đã được xác thực",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP không đúng",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP đã hết hạn",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Đăng ký thành công. Bạn có thể đăng nhập.",
    });
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
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
        message: "Email là bắt buộc",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản đã được xác thực",
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
      subject: "Mã OTP mới - E-Learning Platform",
      text: otpTemplate.text,
      html: otpTemplate.html,
    });

    return res.status(200).json({
      success: true,
      message: "OTP mới đã được gửi tới email của bạn",
    });
  } catch (error) {
    console.error("Lỗi resend OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
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
        message: "Email hoặc mật khẩu không đúng đâu",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng nhé",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Tài khoản chưa xác thực. Vui lòng kiểm tra email để nhập OTP.",
        email: user.email,
      });
    }

    if (user.action === "lock") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
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
    logger.error("Lỗi đăng nhập:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================= LOGIN BY GOOGLE =================
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/signin?error=google_failed`);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
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
      })
    );

    return res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${userData}`
    );
  } catch (err) {
    console.error("Google login error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL}/signin?error=google_login_failed`
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
      newPassword
    );

    await sendEmail({
      to: user.email,
      subject: "Đặt lại mật khẩu - E Learning Platform",
      text: forgotTemplate.text,
      html: forgotTemplate.html,
    });

    return res.json({
      success: true,
      message: "Mật khẩu tạm thời đã được gửi tới email của bạn",
    });
  } catch (error) {
    logger.error("Lỗi forgotPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, mật khẩu mới và xác nhận mật khẩu là bắt buộc",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Xác nhận mật khẩu không khớp",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
    });
  } catch (error) {
    logger.error("Lỗi resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
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
        message: "Token là bắt buộc",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      });
    }

    return res.json({
      success: true,
      message: "Token hợp lệ",
    });
  } catch (error) {
    logger.error("Lỗi verifyResetPasswordToken:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
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
        message: "Vai trò mới là bắt buộc",
      });
    }

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Vai trò không hợp lệ",
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
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: `Vai trò đã được cập nhật thành ${role}`,
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    logger.error("Lỗi thay đổi vai trò:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
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
          "Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Xác nhận mật khẩu không khớp",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
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
        message: "Tài khoản này không bị yêu cầu đổi mật khẩu bắt buộc",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
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