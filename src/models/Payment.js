const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enrollment"
  },

  amount: Number,
  paymentDate: Date,

  status: {
    type: String,
    enum: ["pending", "success", "failed"]
  }

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
