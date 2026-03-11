const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../src/models/User");
const Category = require("../src/models/Category");

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    // Use the URI from .env (MongoDB Atlas or Local)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.\n");

    // 1. Ensure a Category exists
    let category = await Category.findOne();
    if (!category) {
      category = await Category.create({ 
        name: "General", 
        slug: "general", 
        description: "General Category" 
      });
      console.log("Created Category: General");
    } else {
      console.log(`Using existing Category: ${category.name} (${category._id})`);
    }

    // 2. Create Instructor
    const instructorEmail = "instructor@test.com";
    let instructor = await User.findOne({ email: instructorEmail });
    if (!instructor) {
      instructor = await User.create({
        email: instructorEmail,
        fullname: "Test Instructor",
        username: "instructor_test",
        role: "instructor",
        password: "password123",
        isVerified: true
      });
      console.log(`Created Instructor: ${instructorEmail} / password123`);
    } else {
      instructor.role = "instructor"; // Ensure role is correct
      instructor.password = "password123";
      instructor.isVerified = true;
      await instructor.save();
      console.log(`Updated Instructor: ${instructorEmail} / password123`);
    }

    // 3. Create Admin
    const adminEmail = "admin@test.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        email: adminEmail,
        fullname: "Test Admin",
        username: "admin_test",
        role: "admin",
        password: "password123",
        isVerified: true
      });
      console.log(`Created Admin: ${adminEmail} / password123`);
    } else {
      admin.role = "admin"; // Ensure role is correct
      admin.password = "password123";
      admin.isVerified = true;
      await admin.save();
      console.log(`Updated Admin: ${adminEmail} / password123`);
    }

    console.log("\n✅ Seeding complete. You can now use these accounts in Thunder Client.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
