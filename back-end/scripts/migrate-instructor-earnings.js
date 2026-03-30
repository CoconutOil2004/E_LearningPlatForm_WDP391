/**
 * Migration Script: Create InstructorEarning records from existing Payments
 * 
 * Chạy script này để tạo InstructorEarning từ các Payment đã có trong database
 * 
 * Usage: node scripts/migrate-instructor-earnings.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Payment = require("../src/models/Payment");
const InstructorEarning = require("../src/models/InstructorEarning");
const Enrollment = require("../src/models/Enrollment");
const Course = require("../src/models/Course");
const User = require("../src/models/User");
const { COMMISSION } = require("../src/config/payout");

const HOLDING_PERIOD_DAYS = 7;

async function migrateInstructorEarnings() {
  try {
    console.log("🔄 Starting migration: Create InstructorEarning from Payments...");

    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find all successful payments
    const payments = await Payment.find({ status: "success" })
      .populate({
        path: "enrollmentId",
        populate: [
          { path: "courseId", select: "instructorId title price" },
          { path: "userId", select: "fullname email" },
        ],
      })
      .sort({ paymentDate: 1 })
      .lean();

    console.log(`📊 Found ${payments.length} successful payments`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const payment of payments) {
      try {
        // Skip if enrollment or course not found
        if (!payment.enrollmentId || !payment.enrollmentId.courseId) {
          console.log(`⚠️  Skipping payment ${payment._id}: Missing enrollment or course`);
          skipped++;
          continue;
        }

        const course = payment.enrollmentId.courseId;
        const student = payment.enrollmentId.userId;

        // Skip if instructor not found
        if (!course.instructorId) {
          console.log(`⚠️  Skipping payment ${payment._id}: Missing instructor`);
          skipped++;
          continue;
        }

        // Check if earning already exists
        const existingEarning = await InstructorEarning.findOne({
          paymentId: payment._id,
        });

        if (existingEarning) {
          console.log(`⏭️  Skipping payment ${payment._id}: Earning already exists`);
          skipped++;
          continue;
        }

        // Calculate amounts
        const coursePrice = payment.amount;
        const platformFeePercent = COMMISSION.PLATFORM_FEE;
        const platformAmount = Math.round(
          (coursePrice * platformFeePercent) / 100
        );
        const instructorAmount = coursePrice - platformAmount;

        // Calculate dates
        const earnedAt = payment.paymentDate || payment.createdAt;
        const availableAt = new Date(earnedAt);
        availableAt.setDate(availableAt.getDate() + HOLDING_PERIOD_DAYS);

        // Determine status based on availableAt
        const now = new Date();
        const status = now >= availableAt ? "available" : "pending";

        // Create InstructorEarning
        const earning = await InstructorEarning.create({
          instructorId: course.instructorId,
          courseId: course._id,
          paymentId: payment._id,
          enrollmentId: payment.enrollmentId._id,
          studentId: student._id,
          coursePrice,
          platformFeePercent,
          platformAmount,
          instructorAmount,
          status,
          earnedAt,
          availableAt,
        });

        console.log(
          `✅ Created earning for payment ${payment._id}: ${instructorAmount} VND (${status})`
        );
        created++;
      } catch (error) {
        console.error(`❌ Error processing payment ${payment._id}:`, error.message);
        errors++;
      }
    }

    console.log("\n📈 Migration Summary:");
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${payments.length}`);

    // Calculate total earnings by instructor
    console.log("\n💰 Earnings by Instructor:");
    const earningsByInstructor = await InstructorEarning.aggregate([
      {
        $group: {
          _id: "$instructorId",
          totalEarnings: { $sum: "$instructorAmount" },
          availableBalance: {
            $sum: {
              $cond: [{ $eq: ["$status", "available"] }, "$instructorAmount", 0],
            },
          },
          pendingBalance: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$instructorAmount", 0],
            },
          },
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
      { $unwind: "$instructor" },
      { $sort: { totalEarnings: -1 } },
    ]);

    earningsByInstructor.forEach((item) => {
      console.log(
        `   ${item.instructor.fullname || item.instructor.email}:`
      );
      console.log(`      Total: ${item.totalEarnings.toLocaleString()} VND`);
      console.log(`      Available: ${item.availableBalance.toLocaleString()} VND`);
      console.log(`      Pending: ${item.pendingBalance.toLocaleString()} VND`);
      console.log(`      Transactions: ${item.count}`);
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
