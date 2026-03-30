const express = require("express");
const router = express.Router();
const {
  getEarningSummary,
  getMyEarnings,
  getEarningsByCourse,
  getEarningDetail,
  getEarningStats,
  getAllInstructorEarnings,
} = require("../controller/instructorEarningController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authorize");

// ==================== INSTRUCTOR ROUTES ====================

/**
 * @route   GET /api/instructor/earnings/summary
 * @desc    Get earning summary (total, available, pending, paid)
 * @access  Instructor
 */
router.get(
  "/summary",
  protect,
  authorize("instructor", "admin"),
  getEarningSummary
);

/**
 * @route   GET /api/instructor/earnings/by-course
 * @desc    Get earnings grouped by course
 * @access  Instructor
 */
router.get(
  "/by-course",
  protect,
  authorize("instructor", "admin"),
  getEarningsByCourse
);

/**
 * @route   GET /api/instructor/earnings/stats
 * @desc    Get earning statistics for charts
 * @access  Instructor
 */
router.get(
  "/stats",
  protect,
  authorize("instructor", "admin"),
  getEarningStats
);

/**
 * @route   GET /api/instructor/earnings/:id
 * @desc    Get earning detail
 * @access  Instructor
 */
router.get(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  getEarningDetail
);

/**
 * @route   GET /api/instructor/earnings
 * @desc    Get all earnings with filters
 * @access  Instructor
 */
router.get(
  "/",
  protect,
  authorize("instructor", "admin"),
  getMyEarnings
);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/admin/earnings
 * @desc    Get all instructor earnings (admin)
 * @access  Admin
 */
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllInstructorEarnings
);

module.exports = router;
