const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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

  price: Number,

  paymentMethod: {
    type: String,
    enum: ["momo", "vnpay", "stripe", "paypal"]
  },

  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
