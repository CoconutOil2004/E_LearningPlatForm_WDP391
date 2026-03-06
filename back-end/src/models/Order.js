const mongoose = require("mongoose");

/**
 * Single "Buy Now" transaction.
 * Payment logic consolidated here (BR-08): Order created as 'pending',
 * then updated to 'paid' after successful payment; Enrollment is created only then.
 */
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    amount: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => v >= 0,
        message: "Amount must be >= 0"
      }
    },

    paymentMethod: {
      type: String,
      enum: ["momo", "vnpay", "stripe", "paypal"],
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    transactionId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
