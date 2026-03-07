const { User } = require('../models');
const logger = require('../utils/logger');
const bcrypt = require("bcryptjs");
const { sendEmail } = require('../services/emailService');
const { generateRandomPassword } = require('../utils/password');

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    // Search for users by username or fullname
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullname: { $regex: query, $options: 'i' } }
      ],
      action: 'unlock' // Only return unlocked users
    })
    .select('username fullname avatarURL role')
    .limit(10);
    
    logger.info(`User search performed with query: ${query}, found ${users.length} results`);
    
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    logger.error('Error searching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('username fullname avatarURL role');
    
    if (!user) {
      logger.info(`User not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    logger.info(`User fetched by ID: ${id}`);
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

// Lấy thông tin người dùng từ token
const getProfile = async (req, res) => {
    try {
      const userId = req.user.id; // req.user được gán từ middleware xác thực token
  
      const user = await User.findById(userId).select("-password"); // loại bỏ trường password
      if (!user) {
        return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      }
  
      res.json({ success: true, user });
    } catch (error) {
      logger.error("Lỗi khi lấy thông tin profile:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  };
  
  const updateProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const { avatarURL, password, fullname } = req.body;
  
      const updateData = {};
  
      // Nếu có fullname
      if (fullname) {
        updateData.fullname = fullname;
      }
  
      // Nếu có avatarURL
      if (avatarURL) {
        updateData.avatarURL = avatarURL;
      }
  
      // Nếu có mật khẩu mới → hash trước khi lưu
      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ success: false, message: "Mật khẩu phải dài ít nhất 6 ký tự" });
        }
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
  
      // Cập nhật người dùng
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      }
  
      res.json({ success: true, message: "Cập nhật thông tin thành công", user: updatedUser });
    } catch (error) {
      logger.error("Lỗi khi cập nhật profile:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  };

/**
 * Lấy danh sách student
 */
// /api/users/students?page=1&limit=20
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, Math.max(1, parseInt(limit)));

    const [students, total] = await Promise.all([
      User.find({ role: 'student' })
        .select('-password -otp -otpExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(100, Math.max(1, parseInt(limit)))),
      User.countDocuments({ role: 'student' }),
    ]);

    logger.info(`Fetched ${students.length} students (total: ${total})`);

    return res.status(200).json({
      success: true,
      students,
      pagination: {
        page: Math.max(1, parseInt(page)),
        limit: Math.min(100, Math.max(1, parseInt(limit))),
        total,
        totalPages: Math.ceil(total / Math.min(100, Math.max(1, parseInt(limit)))),
      },
    });
  } catch (error) {
    logger.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách student',
    });
  }
};

/**
 * Admin tạo instructor: nhập email, hệ thống tạo password random 10 ký tự và gửi qua email
 */
const createInstructor = async (req, res) => {
  try {
    const { email, fullname } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc',
      });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
      });
    }

    const existingUser = await User.findOne({ email: emailTrimmed });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng bởi tài khoản khác',
      });
    }

    const password = generateRandomPassword(10);

    const user = new User({
      username: emailTrimmed, // Model yêu cầu username, dùng email vì login chỉ cần email + password
      fullname: fullname?.trim() || '',
      email: emailTrimmed,
      password,
      role: 'instructor',
      isVerified: true,
    });
    await user.save();

    const emailContent = `Chào ${fullname?.trim() || 'bạn'},

Bạn đã được admin cấp tài khoản Instructor trên hệ thống.

Thông tin đăng nhập:
- Email: ${emailTrimmed}
- Mật khẩu: ${password}

Vui lòng đăng nhập và đổi mật khẩu để bảo mật tài khoản.`;

    await sendEmail(
      emailTrimmed,
      'Tài khoản Instructor đã được tạo',
      emailContent,
    );

    logger.info(`Instructor created: ${emailTrimmed} by admin`);

    return res.status(201).json({
      success: true,
      message: 'Tạo instructor thành công. Mật khẩu đã được gửi qua email.',
      instructor: {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error creating instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo instructor',
    });
  }
};

/**
 * Lấy danh sách instructor
 */
// /api/users/instructors?page=1&limit=20
const getInstructors = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, Math.max(1, parseInt(limit)));

    const [instructors, total] = await Promise.all([
      User.find({ role: 'instructor' })
        .select('-password -otp -otpExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(100, Math.max(1, parseInt(limit)))),
      User.countDocuments({ role: 'instructor' }),
    ]);

    logger.info(`Fetched ${instructors.length} instructors (total: ${total})`);

    return res.status(200).json({
      success: true,
      instructors,
      pagination: {
        page: Math.max(1, parseInt(page)),
        limit: Math.min(100, Math.max(1, parseInt(limit))),
        total,
        totalPages: Math.ceil(total / Math.min(100, Math.max(1, parseInt(limit)))),
      },
    });
  } catch (error) {
    logger.error('Error fetching instructors:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách instructor',
    });
  }
};

module.exports = {
  searchUsers,
  getUserById,
  getProfile,
  updateProfile,
  getStudents,
  getInstructors,
  createInstructor,
}; 