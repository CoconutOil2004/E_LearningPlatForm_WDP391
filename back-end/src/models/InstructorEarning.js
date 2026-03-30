const mongoose = require("mongoose");

/**
 * InstructorEarning - Theo dõi thu nhập của instructor từ mỗi giao dịch
 * Mỗi khi có payment thành công, tạo 1 record InstructorEarning
 */
const instructorEarningSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Revenue breakdown
    coursePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    platformFeePercent: {
      type: Number,
      required: true,
      default: 20, // Platform giữ 20%
      min: 0,
      max: 100,
    },

    platformAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    instructorAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Status workflow: pending → available → paid
    status: {
      type: String,
      enum: ["pending", "available", "paid"],
      default: "pending",
      index: true,
    },

    // Dates
    earnedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    availableAt: {
      type: Date,
      required: true,
      // Default: 7 ngày sau earnedAt
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // Link to payout when paid
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
      default: null,
    },

    // Notes
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
instructorEarningSchema.index({ instructorId: 1, status: 1 });
instructorEarningSchema.index({ instructorId: 1, earnedAt: -1 });
instructorEarningSchema.index({ courseId: 1, earnedAt: -1 });
instructorEarningSchema.index({ status: 1, availableAt: 1 });

// Virtual: Check if earning is available for payout
instructorEarningSchema.virtual("isAvailable").get(function () {
  return this.status === "available" && new Date() >= this.availableAt;
});

module.exports = mongoose.model("InstructorEarning", instructorEarningSchema);
