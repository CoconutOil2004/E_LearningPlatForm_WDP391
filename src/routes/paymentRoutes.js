const express = require("express");
const router = express.Router();

const {
  createOrder,
  paymentSuccess
} = require("../controllers/paymentController");

router.post("/create-order", createOrder);
router.post("/success", paymentSuccess);

module.exports = router;
