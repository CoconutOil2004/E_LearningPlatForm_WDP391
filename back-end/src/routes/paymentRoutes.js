const express = require("express");
const router = express.Router();

const { protect, requireAdmin } = require("../middleware/authMiddleware");

const {
  createPayment,
  paymentCallback,
  getMyPayments,
  getRevenueSummary,
  getRevenueByDate,
  getRevenueByCourse,
} = require("../controller/paymentController");

router.post("/create", protect, createPayment);

router.get("/callback", paymentCallback);

router.get("/my", protect, getMyPayments);

// Admin revenue analytics
router.get("/admin/revenue/summary", protect, requireAdmin, getRevenueSummary);
router.get("/admin/revenue/daily", protect, requireAdmin, getRevenueByDate);
router.get(
  "/admin/revenue/by-course",
  protect,
  requireAdmin,
  getRevenueByCourse,
);

module.exports = router;
