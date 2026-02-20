const mongoose = require("mongoose");

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