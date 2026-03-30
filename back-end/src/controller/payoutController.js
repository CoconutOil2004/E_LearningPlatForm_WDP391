const mongoose = require("mongoose");
const Payout = require("../models/Payout");
const InstructorEarning = require("../models/InstructorEarning");
const InstructorPaymentSettings = require("../models/InstructorPaymentSettings");
const {
  getInstructorBalance,
  canRequestPayout,
  getAvailableEarningsForPayout,
  calculateTransactionFee,
} = require("../utils/payoutUtils");
const { sendNotification, notifyAdmins } = require("../utils/notificationUtils");

/**
 * POST /api/instructor/payout/request
 * Instructor yêu cầu rút tiền
 * Body: { amount, paymentMethod?, notes? }
 */
exports.requestPayout = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { amount, paymentMethod, notes } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount.",
      });
    }

    // Check if can request payout
    const canPayout = await canRequestPayout(instructorId, amount);
    if (!canPayout.canPayout) {
      return res.status(400).json({
        success: false,
        message: canPayout.reason,
      });
    }

    // Get payment settings
    let paymentSettings = await InstructorPaymentSettings.findOne({
      instructorId,
    });

    if (!paymentSettings) {
      return res.status(400).json({
        success: false,
        message:
          "Please set up your payment method first in Payment Settings.",
      });
    }

    if (!paymentSettings.isComplete()) {
      return res.status(400).json({
        success: false,
        message: "Please complete your payment information in Payment Settings.",
      });
    }

    // Use provided payment method or default from settings
    const selectedMethod = paymentMethod || paymentSettings.preferredMethod;

    // Get payment details based on method
    let paymentDetails = {};
    if (selectedMethod === "bank_transfer") {
      paymentDetails = {
        bankName: paymentSettings.bankDetails.bankName,
        accountNumber: paymentSettings.bankDetails.accountNumber,
        accountName: paymentSettings.bankDetails.accountName,
        branch: paymentSettings.bankDetails.branch,
      };
    } else if (selectedMethod === "paypal") {
      paymentDetails = { paypalEmail: paymentSettings.paypalEmail };
    } else if (selectedMethod === "stripe") {
      paymentDetails = { stripeAccountId: paymentSettings.stripeAccountId };
    } else if (selectedMethod === "momo") {
      paymentDetails = { momoPhone: paymentSettings.momoPhone };
    }

    // Calculate transaction fee
    const transactionFee = calculateTransactionFee(amount);
    const actualAmount = amount - transactionFee;

    // Get earnings to include in this payout
    const earningIds = await getAvailableEarningsForPayout(instructorId, amount);

    // Create payout request
    const payout = await Payout.create({
      instructorId,
      requestedAmount: amount,
      transactionFee,
      actualAmount,
      paymentMethod: selectedMethod,
      paymentDetails,
      status: "pending",
      earningIds,
      notes: notes || "",
    });

    // Notify admins
    await notifyAdmins(
      req.app,
      {
        title: "New Payout Request",
        message: `Instructor ${req.user.fullname || req.user.email} requested payout of ${amount.toLocaleString()} VND`,
        type: "info",
        link: "/admin/payouts/pending",
      },
      instructorId
    );

    res.status(201).json({
      success: true,
      message: "Payout request submitted successfully. Waiting for admin approval.",
      data: payout,
    });
  } catch (error) {
    console.error("requestPayout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while requesting payout.",
    });
  }
};

/**
 * GET /api/instructor/payout/history
 * Lấy lịch sử rút tiền của instructor
 * Query: status, page, limit
 */
exports.getPayoutHistory = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { instructorId };

    if (
      status &&
      ["pending", "processing", "completed", "rejected", "cancelled"].includes(
        status
      )
    ) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .populate("approvedBy", "fullname email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Payout.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: "Payout history retrieved successfully.",
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: payouts,
    });
  } catch (error) {
    console.error("getPayoutHistory error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching payout history.",
    });
  }
};

/**
 * GET /api/instructor/payout/:id
 * Lấy chi tiết 1 payout request
 */
exports.getPayoutDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payout ID.",
      });
    }

    const payout = await Payout.findOne({
      _id: id,
      instructorId,
    })
      .populate("approvedBy", "fullname email")
      .populate({
        path: "earningIds",
        populate: {
          path: "courseId",
          select: "title",
        },
      })
      .lean();

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found.",
      });
    }

    res.json({
      success: true,
      data: payout,
    });
  } catch (error) {
    console.error("getPayoutDetail error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching payout detail.",
    });
  }
};

/**
 * PUT /api/instructor/payout/:id/cancel
 * Instructor hủy payout request (chỉ khi status = pending)
 */
exports.cancelPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payout ID.",
      });
    }

    const payout = await Payout.findOne({
      _id: id,
      instructorId,
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found.",
      });
    }

    if (payout.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel payout with status: ${payout.status}`,
      });
    }

    payout.status = "cancelled";
    await payout.save();

    res.json({
      success: true,
      message: "Payout request cancelled successfully.",
      data: payout,
    });
  } catch (error) {
    console.error("cancelPayout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while cancelling payout.",
    });
  }
};

/**
 * ADMIN: GET /api/admin/payouts/pending
 * Lấy danh sách payout requests chờ duyệt
 */
exports.getPendingPayouts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = { status: "pending" };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .populate("instructorId", "fullname email avatarURL")
        .sort({ createdAt: 1 }) // Oldest first
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Payout.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: "Pending payouts retrieved successfully.",
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: payouts,
    });
  } catch (error) {
    console.error("getPendingPayouts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching pending payouts.",
    });
  }
};

/**
 * ADMIN: GET /api/admin/payouts
 * Lấy tất cả payout requests với filter
 * Query: status, instructorId, from, to, page, limit
 */
exports.getAllPayouts = async (req, res) => {
  try {
    const { status, instructorId, from, to, page = 1, limit = 20 } = req.query;

    const query = {};

    if (
      status &&
      ["pending", "processing", "completed", "rejected", "cancelled"].includes(
        status
      )
    ) {
      query.status = status;
    }

    if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
      query.instructorId = new mongoose.Types.ObjectId(instructorId);
    }

    if (from || to) {
      query.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) query.createdAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) {
          toDate.setHours(23, 59, 59, 999);
          query.createdAt.$lte = toDate;
        }
      }
      if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .populate("instructorId", "fullname email avatarURL")
        .populate("approvedBy", "fullname email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Payout.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: "Payouts retrieved successfully.",
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: payouts,
    });
  } catch (error) {
    console.error("getAllPayouts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching payouts.",
    });
  }
};

/**
 * ADMIN: POST /api/admin/payouts/:id/approve
 * Admin duyệt payout request
 * Body: { transactionId?, adminNotes? }
 */
exports.approvePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, adminNotes } = req.body;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payout ID.",
      });
    }

    const payout = await Payout.findById(id).populate(
      "instructorId",
      "fullname email"
    );

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found.",
      });
    }

    if (payout.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve payout with status: ${payout.status}`,
      });
    }

    // Update payout status
    payout.status = "completed";
    payout.approvedBy = adminId;
    payout.approvedAt = new Date();
    payout.completedAt = new Date();
    payout.transactionId = transactionId || `TXN_${Date.now()}`;
    payout.adminNotes = adminNotes || "";
    await payout.save();

    // Update earnings status to "paid"
    await InstructorEarning.updateMany(
      { _id: { $in: payout.earningIds } },
      {
        $set: {
          status: "paid",
          paidAt: new Date(),
          payoutId: payout._id,
        },
      }
    );

    // Notify instructor
    await sendNotification(req.app, {
      userId: payout.instructorId._id,
      title: "Payout Approved! 💰",
      message: `Your payout request of ${payout.requestedAmount.toLocaleString()} VND has been approved. You will receive ${payout.actualAmount.toLocaleString()} VND.`,
      type: "success",
      link: "/instructor/payout-history",
    });

    res.json({
      success: true,
      data: payout,
    });
  } catch (error) {
    console.error("approvePayout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while approving payout.",
    });
  }
};

/**
 * ADMIN: POST /api/admin/payouts/:id/reject
 * Admin từ chối payout request
 * Body: { reason }
 */
exports.rejectPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payout ID.",
      });
    }

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    const payout = await Payout.findById(id).populate(
      "instructorId",
      "fullname email"
    );

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found.",
      });
    }

    if (payout.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject payout with status: ${payout.status}`,
      });
    }

    payout.status = "rejected";
    payout.approvedBy = adminId;
    payout.approvedAt = new Date();
    payout.rejectionReason = String(reason).trim();
    await payout.save();

    // Notify instructor
    await sendNotification(req.app, {
      userId: payout.instructorId._id,
      title: "Payout Rejected",
      message: `Your payout request of ${payout.requestedAmount.toLocaleString()} VND has been rejected. Reason: ${payout.rejectionReason}`,
      type: "error",
      link: "/instructor/payout-history",
    });

    res.json({
      success: true,
      data: payout,
    });
  } catch (error) {
    console.error("rejectPayout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while rejecting payout.",
    });
  }
};

/**
 * ADMIN: GET /api/admin/payouts/statistics
 * Thống kê tổng quan về payouts
 */
exports.getPayoutStatistics = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {};

    if (from || to) {
      match.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) match.createdAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) {
          toDate.setHours(23, 59, 59, 999);
          match.createdAt.$lte = toDate;
        }
      }
      if (Object.keys(match.createdAt).length === 0) delete match.createdAt;
    }

    const stats = await Payout.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$requestedAmount" },
          totalActualAmount: { $sum: "$actualAmount" },
          totalFees: { $sum: "$transactionFee" },
        },
      },
    ]);

    // Calculate totals
    const summary = {
      pending: { count: 0, totalAmount: 0 },
      processing: { count: 0, totalAmount: 0 },
      completed: { count: 0, totalAmount: 0, totalActualAmount: 0, totalFees: 0 },
      rejected: { count: 0, totalAmount: 0 },
      cancelled: { count: 0, totalAmount: 0 },
      overall: {
        totalRequests: 0,
        totalAmount: 0,
        totalPaidOut: 0,
        totalFees: 0,
      },
    };

    stats.forEach((stat) => {
      if (summary[stat._id]) {
        summary[stat._id].count = stat.count;
        summary[stat._id].totalAmount = stat.totalAmount;
        if (stat._id === "completed") {
          summary[stat._id].totalActualAmount = stat.totalActualAmount;
          summary[stat._id].totalFees = stat.totalFees;
          summary.overall.totalPaidOut = stat.totalActualAmount;
          summary.overall.totalFees = stat.totalFees;
        }
      }
      summary.overall.totalRequests += stat.count;
      summary.overall.totalAmount += stat.totalAmount;
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("getPayoutStatistics error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching payout statistics.",
    });
  }
};
