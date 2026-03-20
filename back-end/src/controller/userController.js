const { User, Enrollment, Course, Order } = require('../models');
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

// Get user profile from token
const getProfile = async (req, res) => {
    try {
      const userId = req.user.id; // req.user is assigned from auth token middleware
  
      const user = await User.findById(userId).select("-password"); // exclude password field
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.json({ success: true, user });
    } catch (error) {
      logger.error("Error fetching profile info:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  const updateProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const { avatarURL, password, fullname } = req.body;
  
      const updateData = {};
  
      // If fullname is provided
      if (fullname) {
        updateData.fullname = fullname;
      }
  
      // If avatarURL is provided
      if (avatarURL) {
        updateData.avatarURL = avatarURL;
      }
  
      // If new password is provided → hash before saving
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
  
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      logger.error("Error updating profile:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

/**
 * Get student list
 */
// /api/users/students?page=1&limit=20
/**
 * Get student list with enrollment statistics
 */
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (p - 1) * l;

    const matchQuery = { role: 'student' };
    if (search) {
      matchQuery.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      matchQuery.action = status;
    }

    const [students, total] = await Promise.all([
      User.aggregate([
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: l },
        // Join with Enrollments to count joined courses
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'userId',
            as: 'enrollments'
          }
        },
        {
          $addFields: {
            enrolledCourses: { $size: '$enrollments' },
            completedCourses: {
              $size: {
                $filter: {
                  input: '$enrollments',
                  as: 'e',
                  cond: { $eq: ['$$e.completed', true] }
                }
              }
            }
          }
        },
        { $project: { password: 0, otp: 0, otpExpires: 0, enrollments: 0 } }
      ]),
      User.countDocuments(matchQuery),
    ]);

    logger.info(`Fetched ${students.length} students with stats (total: ${total})`);

    return res.status(200).json({
      success: true,
      students,
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l),
      },
    });
  } catch (error) {
    logger.error('Error fetching students with stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching student list',
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
        message: 'Email is required',
      });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email',
      });
    }

    const existingUser = await User.findOne({ email: emailTrimmed });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another account',
      });
    }

    const password = generateRandomPassword(10);

    const user = new User({
      username: emailTrimmed, // Model requires username, use email as login only needs email + password
      fullname: fullname?.trim() || '',
      email: emailTrimmed,
      password,
      role: 'instructor',
      isVerified: true,
      mustChangePassword: true, // Force password change on first login
    });
    await user.save();

    const emailContent = `Hello ${fullname?.trim() || 'member'},

You have been granted an Instructor account by the administrator.

Login Information:
- Email: ${emailTrimmed}
- Password: ${password}

Please log in and change your password to secure your account.`;

    await sendEmail({
      to: emailTrimmed,
      subject: 'Instructor account has been created',
      text: emailContent,
    });

    logger.info(`Instructor created: ${emailTrimmed} by admin`);

    return res.status(201).json({
      success: true,
      message: 'Instructor created successfully. Password has been sent to email.',
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
      message: 'Server error while creating instructor',
    });
  }
};

/**
 * Get instructor list
 */
// /api/users/instructors?page=1&limit=20
/**
 * Get instructor list with statistics (Courses, Students, Revenue)
 */
const getInstructors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (p - 1) * l;

    const matchQuery = { role: 'instructor' };
    if (search) {
      matchQuery.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      matchQuery.action = status;
    }

    const [instructors, total] = await Promise.all([
      User.aggregate([
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: l },
        // 1. Join Courses to count number of courses
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: 'instructorId',
            as: 'courses'
          }
        },
        // 2. Join Enrollments through those courses to count total students
        {
          $lookup: {
            from: 'enrollments',
            localField: 'courses._id',
            foreignField: 'courseId',
            as: 'allEnrollments'
          }
        },
        // 3. Join Orders through those courses to calculate total revenue
        {
          $lookup: {
            from: 'orders',
            let: { courseIds: '$courses._id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $in: ['$courseId', '$$courseIds'] }, { $eq: ['$status', 'paid'] }] } } }
            ],
            as: 'paidOrders'
          }
        },
        {
          $addFields: {
            coursesCount: { $size: '$courses' },
            // Count unique students (unique userIds)
            studentsCount: { $size: { $setUnion: ['$allEnrollments.userId'] } },
            totalRevenue: { $sum: '$paidOrders.amount' }
          }
        },
        { $project: { password: 0, otp: 0, otpExpires: 0, courses: 0, allEnrollments: 0, paidOrders: 0 } }
      ]),
      User.countDocuments(matchQuery),
    ]);

    logger.info(`Fetched ${instructors.length} instructors with stats (total: ${total})`);

    return res.status(200).json({
      success: true,
      instructors,
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l),
      },
    });
  } catch (error) {
    logger.error('Error fetching instructors with stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching instructor list',
    });
  }
};

/**
 * Cập nhật action lock/unlock cho tài khoản instructor (chỉ admin)
 * Body: { action: 'lock' | 'unlock' }
 */
const updateInstructorAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!action || !['lock', 'unlock'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "lock" or "unlock"',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'instructor') {
      return res.status(400).json({
        success: false,
        message: 'Only instructor accounts can be locked/unlocked',
      });
    }

    user.action = action;
    await user.save();

    logger.info(`Instructor ${user.email} action updated to "${action}" by admin`);

    return res.status(200).json({
      success: true,
      message: action === 'lock' ? 'Instructor account locked' : 'Instructor account unlocked',
      instructor: {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        action: user.action,
      },
    });
  } catch (error) {
    logger.error('Error updating instructor action:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating instructor status',
    });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isWishlisted = user.watchlist.includes(courseId);
    if (isWishlisted) {
      // Remove from wishlist
      user.watchlist = user.watchlist.filter((id) => id.toString() !== courseId);
    } else {
      // Add to wishlist
      user.watchlist.push(courseId);
    }

    await user.save();
    
    logger.info(`User ${userId} toggled wishlist for course ${courseId}. New state: ${!isWishlisted}`);

    res.json({ 
      success: true, 
      message: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      wishlistIds: user.watchlist 
    });
  } catch (error) {
    logger.error("Error toggling wishlist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateStudentAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!action || !['lock', 'unlock'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "lock" or "unlock"',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Only student accounts can be locked/unlocked',
      });
    }

    user.action = action;
    await user.save();

    logger.info(`Student ${user.email} action updated to "${action}" by admin`);

    return res.status(200).json({
      success: true,
      message: action === 'lock' ? 'Student account locked' : 'Student account unlocked',
      student: {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        action: user.action,
      },
    });
  } catch (error) {
    logger.error('Error updating student action:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating student status',
    });
  }
};

/**
 * Lấy danh sách học viên của Instructor hiện tại
 */
const getInstructorStudents = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (p - 1) * l;

    // 1. Tìm các khóa học của instructor này
    const instructorCourses = await Course.find({ instructorId }).select('_id');
    const courseIds = instructorCourses.map(c => c._id);

    // 2. Aggregate Enrollments của các khóa học đó
    const [enrollments, total] = await Promise.all([
      Enrollment.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: l },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course'
          }
        },
        { $unwind: '$course' },
        {
          $project: {
            _id: 1,
            enrollmentDate: 1,
            progress: 1,
            completed: 1,
            'student.fullname': 1,
            'student.email': 1,
            'student.avatarURL': 1,
            'course.title': 1,
            'course.thumbnail': 1
          }
        }
      ]),
      Enrollment.countDocuments({ courseId: { $in: courseIds } })
    ]);

    res.json({
      success: true,
      students: enrollments,
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l)
      }
    });
  } catch (error) {
    logger.error('Error fetching instructor students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get revenue statistics for the current Instructor
 */
const getInstructorRevenue = async (req, res) => {
  try {
    const instructorId = req.user.id;
    
    // Find courses of this instructor
    const instructorCourses = await Course.find({ instructorId }).select('_id');
    const courseIds = instructorCourses.map(c => c._id);

    // Calculate revenue
    const now = new Date();
    const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalStats, todayStats, monthStats, recentOrders] = await Promise.all([
      // Total Revenue
      Order.aggregate([
        { $match: { courseId: { $in: courseIds }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      // Today's Revenue
      Order.aggregate([
        { $match: { courseId: { $in: courseIds }, status: 'paid', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // This Month's Revenue
      Order.aggregate([
        { $match: { courseId: { $in: courseIds }, status: 'paid', createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Recent Orders
      Order.find({ courseId: { $in: courseIds }, status: 'paid' })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'fullname email avatarURL')
        .populate('courseId', 'title thumbnail')
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue: totalStats[0]?.total || 0,
        totalSales: totalStats[0]?.count || 0,
        todayRevenue: todayStats[0]?.total || 0,
        monthRevenue: monthStats[0]?.total || 0
      },
      recentOrders
    });
  } catch (error) {
    logger.error('Error fetching instructor revenue:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
  updateInstructorAction,
  updateStudentAction,
  toggleWishlist,
  getInstructorStudents,
  getInstructorRevenue,
};