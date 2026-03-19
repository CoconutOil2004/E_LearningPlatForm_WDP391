const express = require("express");
const router = express.Router();

const { protect, isAdmin } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createPaymentValidation } = require("../validations/enrollment.validation");

const {
  createPayment,
  paymentCallback,
  getMyPayments,
  getRevenueSummary,
  getRevenueByDate,
  getRevenueByCourse,
} = require("../controller/paymentController");

router.post("/create", protect, createPaymentValidation, validate, createPayment);

router.get("/callback", paymentCallback);

router.get("/my", protect, getMyPayments);

// Admin revenue analytics
router.get("/admin/revenue/summary", protect, isAdmin, getRevenueSummary);
router.get("/admin/revenue/daily", protect, isAdmin, getRevenueByDate);
router.get(
  "/admin/revenue/by-course",
  protect,
  isAdmin,
  getRevenueByCourse,
);

module.exports = router;
