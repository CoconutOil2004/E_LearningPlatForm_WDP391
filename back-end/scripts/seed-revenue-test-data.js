/**
 * Seed dữ liệu test cho API thống kê doanh thu
 * - Tạo Enrollments (paid) và Payments (status: success) với nhiều ngày khác nhau
 * - Dùng cho: GET /api/payments/admin/revenue/summary, /daily, /by-course
 *
 * Chạy từ thư mục back-end: node scripts/seed-revenue-test-data.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const User = require("../src/models/User");
const Course = require("../src/models/Course");
const Category = require("../src/models/Category");
const Enrollment = require("../src/models/Enrollment");
const Payment = require("../src/models/Payment");

/** Tạo ngày trong quá khứ (daysAgo) lúc 10:00 */
function daysAgo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10, 0, 0, 0);
  return d;
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.\n");

    let users = await User.find().limit(10).lean();
    let courses = await Course.find().limit(10).lean();

    if (users.length === 0) {
      console.log("❌ Chưa có user. Chạy seed-test-accounts.js trước.");
      return;
    }

    // Nếu chưa có course → tự tạo category + instructor + vài khóa học để test doanh thu
    if (courses.length === 0) {
      console.log("Chưa có course → tạo category, instructor và khóa học mẫu...\n");

      let category = await Category.findOne();
      if (!category) {
        category = await Category.create({
          name: "Lập trình",
          slug: "lap-trinh",
          description: "Category cho script seed doanh thu",
        });
        console.log("  Đã tạo Category:", category.name);
      }

      let instructor = await User.findOne({ role: "instructor" });
      if (!instructor) {
        instructor = await User.create({
          email: "instructor-revenue@test.com",
          fullname: "Instructor Test Doanh thu",
          username: "instructor_revenue_test",
          role: "instructor",
          password: "password123",
          isVerified: true,
        });
        console.log("  Đã tạo Instructor:", instructor.email);
      } else {
        instructor = await User.findById(instructor._id).lean();
      }

      const courseTitles = [
        "Khóa học Node.js cơ bản",
        "Khóa học React từ A-Z",
        "Khóa học MongoDB & Mongoose",
      ];
      for (const title of courseTitles) {
        await Course.create({
          title,
          description: "Mô tả khóa học dùng cho test thống kê doanh thu.",
          price: [199000, 299000, 399000][courseTitles.indexOf(title) % 3],
          status: "published",
          category: category._id,
          level: "Beginner",
          instructorId: instructor._id,
        });
      }
      console.log("  Đã tạo", courseTitles.length, "khóa học.\n");

      courses = await Course.find().limit(10).lean();
    }

    console.log(`Dùng ${users.length} user, ${courses.length} course.\n`);

    const paymentMethods = ["vnpay", "momo", "cod"];
    let createdEnrollments = 0;
    let createdPayments = 0;

    // Tạo nhiều cặp (user, course) với payment ở các ngày khác nhau để test thống kê theo ngày/tháng và theo khóa
    const pairs = [];
    for (let u = 0; u < Math.min(4, users.length); u++) {
      for (let c = 0; c < Math.min(4, courses.length); c++) {
        pairs.push({ userId: users[u]._id, courseId: courses[c]._id });
      }
    }

    for (const { userId, courseId } of pairs) {
      let enrollment = await Enrollment.findOne({
        userId,
        courseId,
        paymentStatus: "paid",
      });

      if (!enrollment) {
        enrollment = await Enrollment.create({
          userId,
          courseId,
          paymentStatus: "paid",
          enrollmentDate: new Date(),
        });
        createdEnrollments++;
      }

      const existingPayment = await Payment.findOne({
        enrollmentId: enrollment._id,
        status: "success",
      });
      if (existingPayment) continue;

      const amount = [199000, 299000, 399000, 499000, 599000][
        Math.floor(Math.random() * 5)
      ];
      const paymentDate = daysAgo(Math.floor(Math.random() * 90)); // 0–90 ngày trước

      await Payment.create({
        enrollmentId: enrollment._id,
        amount,
        paymentMethod:
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        transactionId: "SEED-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10),
        status: "success",
        paymentDate,
      });
      createdPayments++;
    }

    // Thêm thêm vài payment cho cùng enrollment (nhiều đơn trong các tháng khác nhau)
    const enrollments = await Enrollment.find({ paymentStatus: "paid" })
      .limit(5)
      .lean();
    for (const enr of enrollments) {
      const count = await Payment.countDocuments({
        enrollmentId: enr._id,
        status: "success",
      });
      if (count >= 2) continue;

      const amount = [199000, 349000, 449000][Math.floor(Math.random() * 3)];
      const paymentDate = daysAgo(15 + Math.floor(Math.random() * 60));

      await Payment.create({
        enrollmentId: enr._id,
        amount,
        paymentMethod: "vnpay",
        transactionId: "SEED-EXT-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        status: "success",
        paymentDate,
      });
      createdPayments++;
    }

    const totalPayments = await Payment.countDocuments({ status: "success" });
    const summary = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);
    const totalRevenue = summary[0]?.total || 0;
    const totalOrders = summary[0]?.count || 0;

    console.log("--- Kết quả ---");
    console.log("Enrollments mới:", createdEnrollments);
    console.log("Payments mới:", createdPayments);
    console.log("Tổng payments (success):", totalPayments);
    console.log("Tổng doanh thu (success):", totalRevenue.toLocaleString("vi-VN"), "VNĐ");
    console.log("Tổng đơn:", totalOrders);
    console.log("\n✅ Seed doanh thu xong. Có thể test:");
    console.log("  GET /api/payments/admin/revenue/summary?from=...&to=...");
    console.log("  GET /api/payments/admin/revenue/daily?groupBy=day|month");
    console.log("  GET /api/payments/admin/revenue/by-course");
  } catch (err) {
    console.error("❌ Seed thất bại:", err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\nDB disconnected.");
  }
}

seed();
