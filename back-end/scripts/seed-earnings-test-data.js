/**
 * Seed Test Data: Create sample Orders and InstructorEarnings for testing
 * 
 * Usage: node scripts/seed-earnings-test-data.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../src/models/Order");
const InstructorEarning = require("../src/models/InstructorEarning");
const Course = require("../src/models/Course");
const User = require("../src/models/User");
const { COMMISSION } = require("../src/config/payout");

async function seedTestData() {
  try {
    console.log("🌱 Starting seed: Create test Orders and Earnings...");

    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find a course with instructor
    const course = await Course.findOne({ instructorId: { $exists: true } }).populate("instructorId");
    if (!course) {
      console.log("❌ No course found. Please create a course first.");
      process.exit(1);
    }
    
    const instructor = course.instructorId;
    if (!instructor) {
      console.log("❌ Course has no instructor.");
      process.exit(1);
    }
    
    console.log(`👨‍🏫 Found instructor: ${instructor.fullname || instructor.email}`);
    console.log(`📚 Found course: ${course.title}`);

    // Find a student
    const student = await User.findOne({ role: "student" });
    if (!student) {
      console.log("❌ No student found. Please create a student first.");
      process.exit(1);
    }
    console.log(`👨‍🎓 Found student: ${student.fullname || student.email}`);

    // Create 5 test orders with different dates
    const ordersToCreate = [];
    const now = new Date();

    for (let i = 0; i < 5; i++) {
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - (i * 3)); // 0, 3, 6, 9, 12 days ago

      ordersToCreate.push({
        userId: student._id,
        courseId: course._id,
        amount: course.price || 500000,
        paymentMethod: "vnpay",
        status: "paid",
        transactionId: `TEST_${Date.now()}_${i}`,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    // Insert orders
    const createdOrders = await Order.insertMany(ordersToCreate);
    console.log(`✅ Created ${createdOrders.length} test orders`);

    // Create earnings from orders
    let earningsCreated = 0;
    const HOLDING_PERIOD_DAYS = 7;

    for (const order of createdOrders) {
      const totalAmount = order.amount;
      const platformAmount = Math.round(totalAmount * COMMISSION.PLATFORM);
      const instructorAmount = totalAmount - platformAmount;

      const orderDate = new Date(order.createdAt);
      const daysSinceOrder = Math.floor(
        (now - orderDate) / (1000 * 60 * 60 * 24)
      );

      let status = "pending";
      let availableAt = new Date(orderDate);
      availableAt.setDate(availableAt.getDate() + HOLDING_PERIOD_DAYS);

      if (daysSinceOrder >= HOLDING_PERIOD_DAYS) {
        status = "available";
      }

      await InstructorEarning.create({
        instructorId: instructor._id,
        courseId: course._id,
        studentId: student._id,
        orderId: order._id,
        totalAmount,
        platformAmount,
        instructorAmount,
        status,
        earnedAt: orderDate,
        availableAt,
      });

      earningsCreated++;
    }

    console.log(`✅ Created ${earningsCreated} instructor earnings`);

    // Show summary
    const summary = await InstructorEarning.aggregate([
      { $match: { instructorId: instructor._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$instructorAmount" },
        },
      },
    ]);

    console.log("\n📊 Earnings Summary:");
    summary.forEach((item) => {
      console.log(
        `   ${item._id}: ${item.count} earnings, ${item.totalAmount.toLocaleString()} VND`
      );
    });

    const totalEarnings = await InstructorEarning.aggregate([
      { $match: { instructorId: instructor._id } },
      {
        $group: {
          _id: null,
          total: { $sum: "$instructorAmount" },
          available: {
            $sum: {
              $cond: [{ $eq: ["$status", "available"] }, "$instructorAmount", 0],
            },
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$instructorAmount", 0],
            },
          },
        },
      },
    ]);

    if (totalEarnings.length > 0) {
      const { total, available, pending } = totalEarnings[0];
      console.log("\n💰 Instructor Balance:");
      console.log(`   Total Earned: ${total.toLocaleString()} VND`);
      console.log(`   Available: ${available.toLocaleString()} VND`);
      console.log(`   Pending: ${pending.toLocaleString()} VND`);
    }

    console.log("\n✅ Seed completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("   1. Login as instructor to view earnings dashboard");
    console.log("   2. Setup payment settings");
    console.log("   3. Request payout");
    console.log("   4. Login as admin to approve payout");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

// Run seed
seedTestData();
