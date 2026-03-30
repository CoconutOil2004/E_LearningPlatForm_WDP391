/**
 * Migration Script: Create InstructorEarning records from existing Orders
 * 
 * Chạy script này để tạo InstructorEarning từ các Order đã paid trong database
 * 
 * Usage: node scripts/migrate-from-orders.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../src/models/Order");
const InstructorEarning = require("../src/models/InstructorEarning");
const Course = require("../src/models/Course");
const User = require("../src/models/User");
const { COMMISSION } = require("../src/config/payout");

const HOLDING_PERIOD_DAYS = 7;

async function migrateInstructorEarnings() {
  try {
    console.log("🔄 Starting migration: Create InstructorEarning from Orders...");

    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find all paid orders
    const orders = await Order.find({ status: "paid" })
      .populate("courseId")
      .populate("userId")
      .lean();

    console.log(`📊 Found ${orders.length} paid orders`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const order of orders) {
      try {
        // Skip if no course
        if (!order.courseId) {
          console.log(`⚠️  Skipping order ${order._id}: Missing course`);
          skipped++;
          continue;
        }

        const course = order.courseId;

        // Skip if course has no instructor
        if (!course.instructorId) {
          console.log(`⚠️  Skipping order ${order._id}: Course has no instructor`);
          skipped++;
          continue;
        }

        // Check if earning already exists
        const existingEarning = await InstructorEarning.findOne({
          orderId: order._id,
        });

        if (existingEarning) {
          skipped++;
          continue;
        }

        // Calculate amounts
        const totalAmount = order.amount;
        const platformAmount = Math.round(totalAmount * COMMISSION.PLATFORM);
        const instructorAmount = totalAmount - platformAmount;

        // Determine status based on order date
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const daysSinceOrder = Math.floor(
          (now - orderDate) / (1000 * 60 * 60 * 24)
        );

        let status = "pending";
        let availableAt = new Date(orderDate);
        availableAt.setDate(availableAt.getDate() + HOLDING_PERIOD_DAYS);

        if (daysSinceOrder >= HOLDING_PERIOD_DAYS) {
          status = "available";
        }

        // Create InstructorEarning
        await InstructorEarning.create({
          instructorId: course.instructorId,
          courseId: course._id,
          studentId: order.userId,
          orderId: order._id,
          totalAmount,
          platformAmount,
          instructorAmount,
          status,
          earnedAt: orderDate,
          availableAt,
        });

        created++;
      } catch (error) {
        console.error(`❌ Error processing order ${order._id}:`, error.message);
        errors++;
      }
    }

    console.log("\n📈 Migration Summary:");
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${orders.length}`);

    // Show earnings by instructor
    const earningsByInstructor = await InstructorEarning.aggregate([
      {
        $group: {
          _id: "$instructorId",
          totalEarnings: { $sum: "$instructorAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "instructor",
        },
      },
      {
        $unwind: "$instructor",
      },
      {
        $project: {
          instructorName: "$instructor.fullname",
          instructorEmail: "$instructor.email",
          totalEarnings: 1,
          count: 1,
        },
      },
      {
        $sort: { totalEarnings: -1 },
      },
    ]);

    console.log("\n💰 Earnings by Instructor:");
    earningsByInstructor.forEach((item) => {
      console.log(
        `   ${item.instructorName || item.instructorEmail}: ${item.totalEarnings.toLocaleString()} VND (${item.count} orders)`
      );
    });

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

// Run migration
migrateInstructorEarnings();
