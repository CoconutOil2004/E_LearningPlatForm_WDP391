/**
 * Test earnings API to see what data is being returned
 */

require("dotenv").config();
const mongoose = require("mongoose");
const InstructorEarning = require("../src/models/InstructorEarning");
const User = require("../src/models/User");
const { getInstructorBalance } = require("../src/utils/payoutUtils");

async function testEarningsAPI() {
  try {
    console.log("🧪 Testing Earnings API...\n");

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Find an instructor
    const instructor = await User.findOne({ role: "instructor" });
    if (!instructor) {
      console.log("❌ No instructor found");
      process.exit(1);
    }

    console.log(`👨‍🏫 Testing with instructor: ${instructor.fullname || instructor.email}`);
    console.log(`   ID: ${instructor._id}\n`);

    // Test 1: Get all earnings for this instructor
    const allEarnings = await InstructorEarning.find({
      instructorId: instructor._id,
    })
      .populate("courseId", "title")
      .populate("studentId", "fullname email");

    console.log(`📊 Total earnings in DB: ${allEarnings.length}`);
    
    if (allEarnings.length > 0) {
      console.log("\nEarnings details:");
      allEarnings.forEach((e, i) => {
        console.log(`\n${i + 1}. Earning ID: ${e._id}`);
        console.log(`   Course: ${e.courseId?.title || "N/A"}`);
        console.log(`   Student: ${e.studentId?.fullname || e.studentId?.email || "N/A"}`);
        console.log(`   Amount: ${e.instructorAmount.toLocaleString()} VND`);
        console.log(`   Status: ${e.status}`);
        console.log(`   Earned At: ${e.earnedAt}`);
        console.log(`   Available At: ${e.availableAt}`);
      });
    }

    // Test 2: Get balance using utility function
    console.log("\n📈 Testing getInstructorBalance()...");
    const balance = await getInstructorBalance(instructor._id);
    console.log("\nBalance result:");
    console.log(JSON.stringify(balance, null, 2));

    // Test 3: Check by status
    const byStatus = await InstructorEarning.aggregate([
      { $match: { instructorId: instructor._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$instructorAmount" },
        },
      },
    ]);

    console.log("\n📊 Earnings by status:");
    byStatus.forEach((s) => {
      console.log(`   ${s._id}: ${s.count} earnings, ${s.total.toLocaleString()} VND`);
    });

    console.log("\n✅ Test completed!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

testEarningsAPI();
