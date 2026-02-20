const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createPayment,
  paymentCallback,
  getMyPayments
} = require("../controller/paymentController");

router.post("/create", protect, createPayment);

router.get("/callback", paymentCallback);

router.get("/my", protect, getMyPayments);

module.exports = router;