// scheduler.js
const cron = require("node-cron");
const {
  verifyPendingPayments,
} = require("../services/paymentVerificationService");
const { updateEarningStatus } = require("../jobs/updateEarningStatus");

/**
 * Khởi tạo tất cả các công việc định kỳ
 * @param {Object} app - Express app instance
 */
const initScheduler = (app) => {
  // Kiểm tra các thanh toán đang chờ mỗi 5 phút
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running scheduled payment verification task...");
    await verifyPendingPayments();
  });

  // Update earning status từ pending → available (chạy hàng ngày lúc 00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled earning status update task...");
    await updateEarningStatus(app);
  });

  console.log("✅ Schedulers initialized:");
  console.log("   - Payment verification: Every 5 minutes");
  console.log("   - Earning status update: Daily at 00:00");
};

module.exports = {
  initScheduler,
};
