/**
 * Force all pending earnings to become available immediately (for testing)
 * 
 * Usage: node scripts/force-earnings-available.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const InstructorEarning = require("../src/models/InstructorEarning");

async function forceEarningsAvailable() {
  try {
    console.log("🔄 Forcing pending earnings to available...");

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found");
    }
    
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find all pending earnings
    const pendingEarnings = await InstructorEarning.find({ status: "pending" })
      .populate("instructorId", "fullname email")
      .populate("courseId", "title");

    console.log(`📊 Found ${pendingEarnings.length} pending earnings\n`);

    if (pendingEarnings.length === 0) {
      console.log("⚠️  No pending earnings found");
      process.exit(0);
    }

    // Show details
    pendingEarnings.forEach((e) => {
      console.log(`- Instructor: ${e.instructorId?.fullname || e.instructorId?.email}`);
      console.log(`  Course: ${e.courseId?.title}`);
      console.log(`  Amount: ${e.instructorAmount.toLocaleString()} VND`);
      console.log(`  Current Available Date: ${e.availableAt}`);
      console.log(`  Will change to: NOW\n`);
    });

    // Update all to available
    const result = await InstructorEarning.updateMany(
      { status: "pending" },
      { 
        $set: { 
          status: "available",
          availableAt: new Date() // Set to now
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} earnings to available`);

    // Show new summary
    const summary = await InstructorEarning.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$instructorAmount" },
        },
      },
    ]);

    console.log("\n📊 New Earnings Summary:");
    summary.forEach((item) => {
      console.log(
        `   ${item._id}: ${item.count} earnings, ${item.totalAmount.toLocaleString()} VND`
      );
    });

    console.log("\n✅ Done! Refresh the instructor earnings page to see available balance.");
    console.log("💡 Next step: Instructor can now click 'Request Payout' button!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

forceEarningsAvailable();
