const mongoose = require("mongoose");
const InstructorEarning = require("../models/InstructorEarning");
const {
  getInstructorBalance,
  getEarningsByCourse,
} = require("../utils/payoutUtils");

/**
 * GET /api/instructor/earnings/summary
 * Lấy tổng quan thu nhập của instructor
 */
exports.getEarningSummary = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const balance = await getInstructorBalance(instructorId);

    res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("getEarningSummary error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching earning summary.",
    });
  }
};

/**
 * GET /api/instructor/earnings
 * Lấy danh sách earnings với filter và pagination
 * Query: status, courseId, from, to, page, limit
 */
exports.getMyEarnings = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { status, courseId, from, to, page = 1, limit = 20 } = req.query;

    const query = { instructorId };

    // Filter by status
    if (status && ["pending", "available", "paid"].includes(status)) {
      query.status = status;
    }

    // Filter by course
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      query.courseId = new mongoose.Types.ObjectId(courseId);
    }

    // Filter by date range
    if (from || to) {
      query.earnedAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) query.earnedAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) {
          toDate.setHours(23, 59, 59, 999);
          query.earnedAt.$lte = toDate;
        }
      }
      if (Object.keys(query.earnedAt).length === 0) delete query.earnedAt;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [earnings, total] = await Promise.all([
      InstructorEarning.find(query)
        .populate("courseId", "title thumbnail price")
        .populate("studentId", "fullname email avatarURL")
        .populate("payoutId", "status transactionId completedAt")
        .sort({ earnedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      InstructorEarning.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: "Earnings retrieved successfully.",
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: earnings,
    });
  } catch (error) {
    console.error("getMyEarnings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching earnings.",
    });
  }
};

/**
 * GET /api/instructor/earnings/by-course
 * Lấy thu nhập theo từng khóa học
 */
exports.getEarningsByCourse = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const earnings = await getEarningsByCourse(instructorId);

    res.json({
      success: true,
      message: "Earnings by course retrieved successfully.",
      data: earnings,
    });
  } catch (error) {
    console.error("getEarningsByCourse error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching earnings by course.",
    });
  }
};

/**
 * GET /api/instructor/earnings/:id
 * Lấy chi tiết 1 earning
 */
exports.getEarningDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid earning ID.",
      });
    }

    const earning = await InstructorEarning.findOne({
      _id: id,
      instructorId,
    })
      .populate("courseId", "title thumbnail price")
      .populate("studentId", "fullname email avatarURL")
      .populate("paymentId", "amount paymentMethod paymentDate transactionId")
      .populate("payoutId", "status requestedAmount actualAmount transactionId completedAt")
      .lean();

    if (!earning) {
      return res.status(404).json({
        success: false,
        message: "Earning not found.",
      });
    }

    res.json({
      success: true,
      data: earning,
    });
  } catch (error) {
    console.error("getEarningDetail error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching earning detail.",
    });
  }
};

/**
 * GET /api/instructor/earnings/stats
 * Thống kê earnings theo thời gian (chart data)
 * Query: groupBy (day|week|month), from, to
 */
exports.getEarningStats = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { groupBy = "day", from, to } = req.query;

    const match = { instructorId };

    // Date filter
    if (from || to) {
      match.earnedAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) match.earnedAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) {
          toDate.setHours(23, 59, 59, 999);
          match.earnedAt.$lte = toDate;
        }
      }
      if (Object.keys(match.earnedAt).length === 0) delete match.earnedAt;
    }

    // Date format based on groupBy
    let dateFormat;
    switch (groupBy) {
      case "week":
        dateFormat = "%Y-W%V"; // Year-Week
        break;
      case "month":
        dateFormat = "%Y-%m";
        break;
      default:
        dateFormat = "%Y-%m-%d";
    }

    const stats = await InstructorEarning.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$earnedAt" },
          },
          totalEarnings: { $sum: "$instructorAmount" },
          count: { $sum: 1 },
          availableAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "available"] }, "$instructorAmount", 0],
            },
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$instructorAmount", 0],
            },
          },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, "$instructorAmount", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: stats.map((s) => ({
        date: s._id,
        totalEarnings: s.totalEarnings,
        count: s.count,
        availableAmount: s.availableAmount,
        pendingAmount: s.pendingAmount,
        paidAmount: s.paidAmount,
      })),
    });
  } catch (error) {
    console.error("getEarningStats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching earning stats.",
    });
  }
};

/**
 * ADMIN: GET /api/admin/earnings
 * Lấy tất cả earnings của tất cả instructors
 * Query: status, instructorId, from, to, page, limit
 */
exports.getAllInstructorEarnings = async (req, res) => {
  try {
    const { status, instructorId, from, to, page = 1, limit = 100 } = req.query;

    const query = {};

    // Filter by status
    if (status && ["pending", "available", "paid"].includes(status)) {
      query.status = status;
    }

    // Filter by instructor
    if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
      query.instructorId = new mongoose.Types.ObjectId(instructorId);
    }

    // Filter by date range
    if (from || to) {
      query.earnedAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) query.earnedAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) {
          toDate.setHours(23, 59, 59, 999);
          query.earnedAt.$lte = toDate;
        }
      }
      if (Object.keys(query.earnedAt).length === 0) delete query.earnedAt;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));

    const [earnings, total] = await Promise.all([
      InstructorEarning.find(query)
        .populate("instructorId", "fullname email avatarURL")
        .populate("courseId", "title thumbnail price")
        .populate("studentId", "fullname email")
        .populate("payoutId", "status transactionId completedAt")
        .sort({ earnedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      InstructorEarning.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: "All instructor earnings retrieved successfully.",
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: earnings,
    });
  } catch (error) {
    console.error("getAllInstructorEarnings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching all instructor earnings.",
    });
  }
};
