const mongoose = require("mongoose");
const InstructorPaymentSettings = require("../models/InstructorPaymentSettings");

/**
 * GET /api/instructor/payment-settings
 * Lấy payment settings của instructor
 */
exports.getPaymentSettings = async (req, res) => {
  try {
    const instructorId = req.user._id;

    let settings = await InstructorPaymentSettings.findOne({ instructorId });

    // Create default settings if not exists
    if (!settings) {
      settings = await InstructorPaymentSettings.create({
        instructorId,
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("getPaymentSettings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching payment settings.",
    });
  }
};

/**
 * PUT /api/instructor/payment-settings
 * Cập nhật payment settings
 * Body: { preferredMethod, minimumPayout, bankDetails, paypalEmail, stripeAccountId, momoPhone, autoPayoutEnabled, autoPayoutThreshold }
 */
exports.updatePaymentSettings = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const {
      preferredMethod,
      minimumPayout,
      bankDetails,
      paypalEmail,
      stripeAccountId,
      momoPhone,
      taxId,
      taxCountry,
      autoPayoutEnabled,
      autoPayoutThreshold,
      notes,
    } = req.body;

    let settings = await InstructorPaymentSettings.findOne({ instructorId });

    if (!settings) {
      settings = new InstructorPaymentSettings({ instructorId });
    }

    // Update fields
    if (preferredMethod !== undefined) {
      if (
        !["bank_transfer", "paypal", "stripe", "momo"].includes(preferredMethod)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment method.",
        });
      }
      settings.preferredMethod = preferredMethod;
    }

    if (minimumPayout !== undefined) {
      const minAmount = Number(minimumPayout);
      if (minAmount < 100000) {
        return res.status(400).json({
          success: false,
          message: "Minimum payout must be at least 100,000 VND.",
        });
      }
      settings.minimumPayout = minAmount;
    }

    if (bankDetails !== undefined) {
      settings.bankDetails = {
        bankName: bankDetails.bankName || settings.bankDetails.bankName || "",
        accountNumber:
          bankDetails.accountNumber || settings.bankDetails.accountNumber || "",
        accountName:
          bankDetails.accountName || settings.bankDetails.accountName || "",
        branch: bankDetails.branch || settings.bankDetails.branch || "",
      };
    }

    if (paypalEmail !== undefined) {
      settings.paypalEmail = paypalEmail;
    }

    if (stripeAccountId !== undefined) {
      settings.stripeAccountId = stripeAccountId;
    }

    if (momoPhone !== undefined) {
      settings.momoPhone = momoPhone;
    }

    if (taxId !== undefined) {
      settings.taxId = taxId;
    }

    if (taxCountry !== undefined) {
      settings.taxCountry = taxCountry;
    }

    if (autoPayoutEnabled !== undefined) {
      settings.autoPayoutEnabled = Boolean(autoPayoutEnabled);
    }

    if (autoPayoutThreshold !== undefined) {
      const threshold = Number(autoPayoutThreshold);
      if (threshold < 500000) {
        return res.status(400).json({
          success: false,
          message: "Auto payout threshold must be at least 500,000 VND.",
        });
      }
      settings.autoPayoutThreshold = threshold;
    }

    if (notes !== undefined) {
      settings.notes = notes;
    }

    await settings.save();

    res.json({
      success: true,
      message: "Payment settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("updatePaymentSettings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating payment settings.",
    });
  }
};

/**
 * ADMIN: PUT /api/admin/payment-settings/:instructorId/verify
 * Admin xác minh payment settings của instructor
 * Body: { isVerified, notes? }
 */
exports.verifyPaymentSettings = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { isVerified, notes } = req.body;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid instructor ID.",
      });
    }

    const settings = await InstructorPaymentSettings.findOne({ instructorId });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Payment settings not found.",
      });
    }

    settings.isVerified = Boolean(isVerified);
    settings.verifiedAt = isVerified ? new Date() : null;
    settings.verifiedBy = isVerified ? adminId : null;

    if (notes !== undefined) {
      settings.notes = notes;
    }

    await settings.save();

    res.json({
      success: true,
      message: `Payment settings ${isVerified ? "verified" : "unverified"} successfully.`,
      data: settings,
    });
  } catch (error) {
    console.error("verifyPaymentSettings error:", error);
    res.status(500).json({
      success: false,
      message:
        error.message || "Server error while verifying payment settings.",
    });
  }
};

/**
 * ADMIN: GET /api/admin/payment-settings
 * Lấy payment settings của tất cả instructors
 * Query: isVerified, page, limit
 */
exports.getAllPaymentSettings = async (req, res) => {
  try {
    const { isVerified, page = 1, limit = 20 } = req.query;

    const query = {};

    if (isVerified !== undefined) {
      query.isVerified = isVerified === "true";
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [settings, total] = await Promise.all([
      InstructorPaymentSettings.find(query)
        .populate("instructorId", "fullname email avatarURL")
        .populate("verifiedBy", "fullname email")
        .sort({ updatedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      InstructorPaymentSettings.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: "Payment settings retrieved successfully.",
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: settings,
    });
  } catch (error) {
    console.error("getAllPaymentSettings error:", error);
    res.status(500).json({
      success: false,
      message:
        error.message || "Server error while fetching payment settings.",
    });
  }
};
