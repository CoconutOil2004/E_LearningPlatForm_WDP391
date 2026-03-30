const mongoose = require("mongoose");

/**
 * InstructorPaymentSettings - Cài đặt thanh toán của instructor
 * Mỗi instructor có 1 document duy nhất
 */
const instructorPaymentSettingsSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Payment preferences
    preferredMethod: {
      type: String,
      enum: ["bank_transfer", "paypal", "stripe", "momo"],
      default: "bank_transfer",
    },

    minimumPayout: {
      type: Number,
      default: 500000, // 500,000 VND
      min: 100000, // Tối thiểu 100k
    },

    // Bank transfer details
    bankDetails: {
      bankName: {
        type: String,
        default: "",
      },
      accountNumber: {
        type: String,
        default: "",
      },
      accountName: {
        type: String,
        default: "",
      },
      branch: {
        type: String,
        default: "",
      },
    },

    // PayPal
    paypalEmail: {
      type: String,
      default: "",
    },

    // Stripe
    stripeAccountId: {
      type: String,
      default: "",
    },

    // Momo
    momoPhone: {
      type: String,
      default: "",
    },

    // Tax information
    taxId: {
      type: String,
      default: "",
    },

    taxCountry: {
      type: String,
      default: "VN",
    },

    // Auto payout settings
    autoPayoutEnabled: {
      type: Boolean,
      default: false,
    },

    autoPayoutThreshold: {
      type: Number,
      default: 5000000, // 5 triệu VND
      min: 500000,
    },

    // Verification status
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// Method: Check if payment settings are complete
instructorPaymentSettingsSchema.methods.isComplete = function () {
  if (this.preferredMethod === "bank_transfer") {
    return !!(
      this.bankDetails.bankName &&
      this.bankDetails.accountNumber &&
      this.bankDetails.accountName
    );
  } else if (this.preferredMethod === "paypal") {
    return !!this.paypalEmail;
  } else if (this.preferredMethod === "stripe") {
    return !!this.stripeAccountId;
  } else if (this.preferredMethod === "momo") {
    return !!this.momoPhone;
  }
  return false;
};

module.exports = mongoose.model(
  "InstructorPaymentSettings",
  instructorPaymentSettingsSchema
);
