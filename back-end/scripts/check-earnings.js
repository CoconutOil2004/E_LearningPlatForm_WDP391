require("dotenv").config();
const mongoose = require("mongoose");
const InstructorEarning = require("../src/models/InstructorEarning");

async function checkEarnings() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    
    const earnings = await InstructorEarning.find()
      .populate("instructorId", "fullname email")
      .populate("courseId", "title");
    
    console.log(`Total earnings: ${earnings.length}\n`);
    
    earnings.forEach((e) => {
      console.log(`- Instructor: ${e.instructorId?.fullname || e.instructorId?.email}`);
      console.log(`  Course: ${e.courseId?.title}`);
      console.log(`  Amount: ${e.instructorAmount.toLocaleString()} VND`);
      console.log(`  Status: ${e.status}`);
      console.log(`  Earned At: ${e.earnedAt}`);
      console.log(`  Available At: ${e.availableAt}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkEarnings();
