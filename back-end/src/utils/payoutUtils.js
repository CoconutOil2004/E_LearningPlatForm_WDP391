/**
 * Payout Utility Functions
 * Helper functions for instructor earnings and payouts
 */

const InstructorEarning = require("../models/InstructorEarning");
const Payout = require("../models/Payout");
const { COMMISSION, PAYOUT } = require("../config/payout");

/**
 * Calculate instructor earning from course price
 * @param {Number} coursePrice - Giá khóa học
 * @returns {Object} { platformAmount, instructorAmount, platformFeePercent }
 */
const calculateEarning = (coursePrice) => {
  const platformFeePercent = COMMISSION.PLATFORM_FEE;
  const platformAmount = Math.round((coursePrice * platformFeePercent) / 100);
  const instructorAmount = coursePrice - platformAmount;

  return {
    platformAmount,
    instructorAmount,
    platformFeePercent,
  };
};

/**
 * Calculate available date for earning (earnedAt + holding period)
 * @param {Date} earnedAt - Ngày phát sinh thu nhập
 * @returns {Date} availableAt
 */
const calculateAvailableDate = (earnedAt) => {
  const availableAt = new Date(earnedAt);
  availableAt.setDate(availableAt.getDate() + PAYOUT.HOLDING_PERIOD_DAYS);
  return availableAt;
};

/**
 * Calculate transaction fee for payout
 * @param {Number} amount - Số tiền rút
 * @returns {Number} transactionFee
 */
const calculateTransactionFee = (amount) => {
  return Math.round((amount * PAYOUT.TRANSACTION_FEE_PERCENT) / 100);
};

/**
 * Get instructor balance summary
 * @param {ObjectId} instructorId
 * @returns {Object} { totalEarned, availableBalance, pendingBalance, paidOut }
 */
const getInstructorBalance = async (instructorId) => {
  const result = await InstructorEarning.aggregate([
    { $match: { instructorId } },
    {
      $group: {
        _id: null,
        totalEarned: { $sum: "$instructorAmount" },
        availableBalance: {
          $sum: {
            $cond: [
              { $eq: ["$status", "available"] },
              "$instructorAmount",
              0,
            ],
          },
        },
        pendingBalance: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, "$instructorAmount", 0],
          },
        },
        paidOut: {
          $sum: {
            $cond: [{ $eq: ["$status", "paid"] }, "$instructorAmount", 0],
          },
        },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalEarned: 0,
      availableBalance: 0,
      pendingBalance: 0,
      paidOut: 0,
    };
  }

  return result[0];
};

/**
 * Get earnings by course for instructor
 * @param {ObjectId} instructorId
 * @returns {Array} earnings by course
 */
const getEarningsByCourse = async (instructorId) => {
  return await InstructorEarning.aggregate([
    { $match: { instructorId } },
    {
      $group: {
        _id: "$courseId",
        totalEarnings: { $sum: "$instructorAmount" },
        studentCount: { $sum: 1 },
        availableBalance: {
          $sum: {
            $cond: [
              { $eq: ["$status", "available"] },
              "$instructorAmount",
              0,
            ],
          },
        },
        pendingBalance: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, "$instructorAmount", 0],
          },
        },
        paidOut: {
          $sum: {
            $cond: [{ $eq: ["$status", "paid"] }, "$instructorAmount", 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    { $sort: { totalEarnings: -1 } },
  ]);
};

/**
 * Check if instructor can request payout
 * @param {ObjectId} instructorId
 * @param {Number} requestedAmount
 * @returns {Object} { canPayout, reason }
 */
const canRequestPayout = async (instructorId, requestedAmount) => {
  // Check minimum amount
  if (requestedAmount < PAYOUT.MINIMUM_AMOUNT) {
    return {
      canPayout: false,
      reason: `Minimum payout amount is ${PAYOUT.MINIMUM_AMOUNT.toLocaleString()} VND`,
    };
  }

  // Check available balance
  const balance = await getInstructorBalance(instructorId);
  if (requestedAmount > balance.availableBalance) {
    return {
      canPayout: false,
      reason: `Insufficient balance. Available: ${balance.availableBalance.toLocaleString()} VND`,
    };
  }

  // Check monthly limit
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyPayouts = await Payout.aggregate([
    {
      $match: {
        instructorId,
        status: { $in: ["completed", "processing"] },
        createdAt: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalPaidOut: { $sum: "$requestedAmount" },
      },
    },
  ]);

  const totalThisMonth =
    monthlyPayouts.length > 0 ? monthlyPayouts[0].totalPaidOut : 0;

  if (totalThisMonth + requestedAmount > PAYOUT.MAX_PAYOUT_PER_MONTH) {
    return {
      canPayout: false,
      reason: `Monthly payout limit exceeded. Limit: ${PAYOUT.MAX_PAYOUT_PER_MONTH.toLocaleString()} VND`,
    };
  }

  return { canPayout: true };
};

/**
 * Get available earnings for payout
 * @param {ObjectId} instructorId
 * @param {Number} amount - Số tiền cần rút
 * @returns {Array} List of earning IDs
 */
const getAvailableEarningsForPayout = async (instructorId, amount) => {
  const earnings = await InstructorEarning.find({
    instructorId,
    status: "available",
  })
    .sort({ earnedAt: 1 }) // FIFO: First In First Out
    .lean();

  const selectedEarnings = [];
  let totalAmount = 0;

  for (const earning of earnings) {
    if (totalAmount >= amount) break;
    selectedEarnings.push(earning._id);
    totalAmount += earning.instructorAmount;
  }

  return selectedEarnings;
};

module.exports = {
  calculateEarning,
  calculateAvailableDate,
  calculateTransactionFee,
  getInstructorBalance,
  getEarningsByCourse,
  canRequestPayout,
  getAvailableEarningsForPayout,
};
