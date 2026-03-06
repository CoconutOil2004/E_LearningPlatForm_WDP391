const mongoose = require("mongoose");

/**
 * @deprecated Payment logic is consolidated in Order.js (Buy Now flow).
 * Order holds: userId, courseId, amount, paymentMethod, status, transactionId.
 * This model kept for legacy/audit until controllers are migrated to Order.
 */
const paymentSchema = new mongoose.Schema({
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enrollment",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["vnpay", "momo", "stripe", "paypal", "cod"],
    required: true
  },

  transactionId: {
    type: String
  },

  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },

  paymentDate: Date

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);