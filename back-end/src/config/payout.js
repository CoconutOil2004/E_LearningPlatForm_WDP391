/**
 * Payout Configuration
 * Cấu hình hoa hồng và thanh toán cho instructor
 */

module.exports = {
  // Commission rates (%)
  COMMISSION: {
    PLATFORM_FEE: 20, // Nền tảng giữ 20%
    INSTRUCTOR_SHARE: 80, // Instructor nhận 80%
  },

  // Payout settings
  PAYOUT: {
    MINIMUM_AMOUNT: 500000, // Tối thiểu 500,000 VND để rút
    HOLDING_PERIOD_DAYS: 7, // Giữ 7 ngày trước khi cho phép rút
    TRANSACTION_FEE_PERCENT: 2, // Phí giao dịch 2%
    MAX_PAYOUT_PER_MONTH: 50000000, // Tối đa 50 triệu VND/tháng
    AUTO_PAYOUT_THRESHOLD: 5000000, // Ngưỡng tự động rút: 5 triệu VND
  },

  // Payment methods
  PAYMENT_METHODS: {
    BANK_TRANSFER: "bank_transfer",
    PAYPAL: "paypal",
    STRIPE: "stripe",
    MOMO: "momo",
  },

  // Status
  EARNING_STATUS: {
    PENDING: "pending", // Đang giữ, chưa thể rút
    AVAILABLE: "available", // Có thể rút
    PAID: "paid", // Đã chi trả
  },

  PAYOUT_STATUS: {
    PENDING: "pending", // Chờ admin duyệt
    PROCESSING: "processing", // Đang xử lý
    COMPLETED: "completed", // Hoàn thành
    REJECTED: "rejected", // Bị từ chối
    CANCELLED: "cancelled", // Bị hủy
  },
};
