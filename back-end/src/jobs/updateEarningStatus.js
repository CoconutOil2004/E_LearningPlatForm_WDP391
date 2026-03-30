/**
 * Scheduled Job: Update Earning Status
 * 
 * Chạy hàng ngày để update status của earnings từ "pending" → "available"
 * khi đã qua holding period (7 ngày)
 * 
 * Schedule: Daily at 00:00
 */

const InstructorEarning = require("../models/InstructorEarning");
const { sendNotification } = require("../utils/notificationUtils");

/**
 * Update earnings from pending to available
 * @param {Object} app - Express app instance (for notifications)
 */
const updateEarningStatus = async (app) => {
  try {
    console.log("🔄 [Job] Starting: Update Earning Status...");

    const now = new Date();

    // Find all pending earnings where availableAt <= now
    const pendingEarnings = await InstructorEarning.find({
      status: "pending",
      availableAt: { $lte: now },
    })
      .populate("instructorId", "fullname email")
      .populate("courseId", "title")
      .lean();

    console.log(`📊 Found ${pendingEarnings.length} earnings ready to be available`);

    if (pendingEarnings.length === 0) {
      console.log("✅ No earnings to update");
      return;
    }

    // Group by instructor for batch notification
    const earningsByInstructor = {};

    for (const earning of pendingEarnings) {
      const instructorId = earning.instructorId._id.toString();

      if (!earningsByInstructor[instructorId]) {
        earningsByInstructor[instructorId] = {
          instructor: earning.instructorId,
          earnings: [],
          totalAmount: 0,
        };
      }

      earningsByInstructor[instructorId].earnings.push(earning);
      earningsByInstructor[instructorId].totalAmount += earning.instructorAmount;
    }

    // Update status to "available"
    const earningIds = pendingEarnings.map((e) => e._id);
    const updateResult = await InstructorEarning.updateMany(
      { _id: { $in: earningIds } },
      { $set: { status: "available" } }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} earnings to "available"`);

    // Send notifications to instructors
    for (const instructorId in earningsByInstructor) {
      const { instructor, earnings, totalAmount } = earningsByInstructor[instructorId];

      try {
        await sendNotification(app, {
          userId: instructor._id,
          title: "Earnings Available! 💰",
          message: `Your earnings of ${totalAmount.toLocaleString()} VND from ${earnings.length} sale(s) are now available for withdrawal.`,
          type: "success",
          link: "/instructor/earnings",
        });

        console.log(
          `📧 Sent notification to ${instructor.fullname || instructor.email}: ${totalAmount.toLocaleString()} VND`
        );
      } catch (notifError) {
        console.error(
          `❌ Failed to send notification to ${instructor.email}:`,
          notifError.message
        );
      }
    }

    console.log("✅ [Job] Completed: Update Earning Status");
  } catch (error) {
    console.error("❌ [Job] Failed: Update Earning Status:", error);
  }
};

module.exports = { updateEarningStatus };
