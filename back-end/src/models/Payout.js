const mongoose = require("mongoose");

/**
 * Payout - Theo dõi các lần rút tiền của instructor
 * Instructor tạo payout request → Admin approve → Transfer money
 */
const payoutSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Amount details
    requestedAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    transactionFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    actualAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "paypal", "stripe", "momo"],
      required: true,
    },

    paymentDetails: {
      // For bank transfer
      bankName: String,
      accountNumber: String,
      accountName: String,
      branch: String,

      // For PayPal
      paypalEmail: String,

      // For Stripe
      stripeAccountId: String,

      // For Momo
      momoPhone: String,
    },

    // Status workflow: pending → processing → completed/rejected
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    // Admin approval
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    // Transaction details
    transactionId: {
      type: String,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Earnings included in this payout
    earningIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstructorEarning",
      },
    ],

    // Notes
    notes: {
      type: String,
      default: "",
    },

    // Admin notes (internal)
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
payoutSchema.index({ instructorId: 1, status: 1 });
payoutSchema.index({ instructorId: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Payout", payoutSchema);
