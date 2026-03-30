/**
 * Quick Fix: Update all pending earnings to available for testing
 * 
 * Usage: node scripts/update-earnings-to-available.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const InstructorEarning = require("../src/models/InstructorEarning");

async function updateEarningsToAvailable() {
  try {
    console.log("🔄 Updating pending earnings to available...");

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found");
    }
    
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Update all pending earnings to available
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

    // Show summary
    const summary = await InstructorEarning.aggregate([
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

    console.log("\n✅ Done! Instructors can now request payout.");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

updateEarningsToAvailable();
