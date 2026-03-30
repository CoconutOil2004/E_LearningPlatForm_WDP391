const express = require("express");
const router = express.Router();
const {
  requestPayout,
  getPayoutHistory,
  getPayoutDetail,
  cancelPayout,
  getPendingPayouts,
  getAllPayouts,
  approvePayout,
  rejectPayout,
  getPayoutStatistics,
} = require("../controller/payoutController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authorize");

// ==================== INSTRUCTOR ROUTES ====================

/**
 * @route   POST /api/instructor/payout/request
 * @desc    Request payout
 * @access  Instructor
 */
router.post(
  "/request",
  protect,
  authorize("instructor"),
  requestPayout
);

/**
 * @route   GET /api/instructor/payout/history
 * @desc    Get payout history
 * @access  Instructor
 */
router.get(
  "/history",
  protect,
  authorize("instructor"),
  getPayoutHistory
);

/**
 * @route   GET /api/instructor/payout/:id
 * @desc    Get payout detail
 * @access  Instructor
 */
router.get(
  "/:id",
  protect,
  authorize("instructor"),
  getPayoutDetail
);

/**
 * @route   PUT /api/instructor/payout/:id/cancel
 * @desc    Cancel payout request
 * @access  Instructor
 */
router.put(
  "/:id/cancel",
  protect,
  authorize("instructor"),
  cancelPayout
);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/admin/payouts/pending
 * @desc    Get pending payout requests
 * @access  Admin
 */
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  getPendingPayouts
);

/**
 * @route   GET /api/admin/payouts/statistics
 * @desc    Get payout statistics
 * @access  Admin
 */
router.get(
  "/admin/statistics",
  protect,
  authorize("admin"),
  getPayoutStatistics
);

/**
 * @route   GET /api/admin/payouts
 * @desc    Get all payouts with filters
 * @access  Admin
 */
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllPayouts
);

/**
 * @route   POST /api/admin/payouts/:id/approve
 * @desc    Approve payout request
 * @access  Admin
 */
router.post(
  "/admin/:id/approve",
  protect,
  authorize("admin"),
  approvePayout
);

/**
 * @route   POST /api/admin/payouts/:id/reject
 * @desc    Reject payout request
 * @access  Admin
 */
router.post(
  "/admin/:id/reject",
  protect,
  authorize("admin"),
  rejectPayout
);

module.exports = router;
