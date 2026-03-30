const express = require("express");
const router = express.Router();
const {
  getPaymentSettings,
  updatePaymentSettings,
  verifyPaymentSettings,
  getAllPaymentSettings,
} = require("../controller/paymentSettingsController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authorize");

// ==================== INSTRUCTOR ROUTES ====================

/**
 * @route   GET /api/instructor/payment-settings
 * @desc    Get payment settings
 * @access  Instructor
 */
router.get(
  "/",
  protect,
  authorize("instructor"),
  getPaymentSettings
);

/**
 * @route   PUT /api/instructor/payment-settings
 * @desc    Update payment settings
 * @access  Instructor
 */
router.put(
  "/",
  protect,
  authorize("instructor"),
  updatePaymentSettings
);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/admin/payment-settings
 * @desc    Get all payment settings
 * @access  Admin
 */
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllPaymentSettings
);

/**
 * @route   PUT /api/admin/payment-settings/:instructorId/verify
 * @desc    Verify instructor payment settings
 * @access  Admin
 */
router.put(
  "/admin/:instructorId/verify",
  protect,
  authorize("admin"),
  verifyPaymentSettings
);

module.exports = router;
