const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Course = require("../src/models/Course");
const User = require("../src/models/User");
const Category = require("../src/models/Category");
const courseController = require("../src/controller/courseController");

async function runTest() {
  try {
    console.log("Connecting to MongoDB...");
    const TEST_URI = "mongodb://127.0.0.1:27017/E_Learning_Test";
    await mongoose.connect(TEST_URI);
    console.log("Connected to " + TEST_URI + "\n");

    // 1. Setup Test Data
    console.log("1. Setting up test data...");
    
    // Create Category if not exists
    let category = await Category.findOne({ name: "Test Category" });
    if (!category) {
      category = await Category.create({ name: "Test Category", slug: "test-category", description: "Test" });
    }

    // Create Instructor
    let instructor = await User.findOne({ email: "instructor@test.com" });
    if (!instructor) {
      instructor = await User.create({
        email: "instructor@test.com",
        fullname: "Test Instructor",
        username: "testinstructor",
        role: "instructor",
        password: "password123",
        isVerified: true
      });
    }

    // Create Admin
    let admin = await User.findOne({ email: "admin@test.com" });
    if (!admin) {
      admin = await User.create({
        email: "admin@test.com",
        fullname: "Test Admin",
        username: "testadmin",
        role: "admin",
        password: "password123",
        isVerified: true
      });
    }

    console.log("   Setup complete.\n");

    // Mock res object
    const res = {
      status: function(s) { this.statusCode = s; return this; },
      json: function(d) { this.data = d; return this; }
    };

    // 2. Create Course (Instructor)
    console.log("2. Creating Course as Instructor...");
    const reqCreate = {
      user: instructor,
      body: {
        title: "Test Course Flow " + Date.now(),
        description: "Test Description",
        categoryId: category._id.toString(),
        level: "Beginner"
      }
    };
    await courseController.createCourse(reqCreate, res);
    const course = res.data.data;
    console.log(`   OK. Course Created: ${course.title} (Status: ${course.status})\n`);

    // 3. Update Course (Should work in draft)
    console.log("3. Updating Course in Draft status...");
    const reqUpdateDraft = {
      params: { courseId: course._id },
      user: instructor,
      body: { title: "Updated Test Course Title" }
    };
    await courseController.updateCourse(reqUpdateDraft, res);
    console.log(`   OK. Status: ${res.data.success ? "Success" : "Failed"} (Status: ${res.data.data.status})\n`);

    // 4. Submit Course
    console.log("4. Submitting Course for review...");
    const reqSubmit = {
      params: { courseId: course._id },
      user: instructor
    };
    await courseController.submitCourse(reqSubmit, res);
    console.log(`   OK. Status: ${res.data.success ? "Success" : "Failed"} (New Status: ${res.data.data.status})\n`);

    // 5. Try Update while Pending (Should FAIL)
    console.log("5. Attempting to update course while PENDING (Should Fail)...");
    const reqUpdatePending = {
      params: { courseId: course._id },
      user: instructor,
      body: { title: "Attempting to change pending course" }
    };
    await courseController.updateCourse(reqUpdatePending, res);
    if (res.statusCode === 400) {
      console.log(`   OK. Blocked correctly: ${res.data.message}\n`);
    } else {
      console.log(`   FAIL. Expected 400 but got ${res.statusCode}\n`);
    }

    // 6. Admin Get Pending Courses
    console.log("6. Admin fetching pending courses...");
    const reqGetPending = { user: admin };
    await courseController.getPendingCourses(reqGetPending, res);
    console.log(`   OK. Found ${res.data.count} pending courses.\n`);

    // 7. Admin Approve Course
    console.log("7. Admin Approving course...");
    const reqApprove = {
      params: { courseId: course._id },
      user: admin
    };
    await courseController.approveCourse(reqApprove, res);
    console.log(`   OK. Status: ${res.data.success ? "Success" : "Failed"} (New Status: ${res.data.data.status})\n`);

    // 8. Try Update while Published (Should FAIL)
    console.log("8. Attempting to update course while PUBLISHED (Should Fail)...");
    const reqUpdatePublished = {
      params: { courseId: course._id },
      user: instructor,
      body: { title: "Attempting to change published course" }
    };
    await courseController.updateCourse(reqUpdatePublished, res);
    if (res.statusCode === 400) {
      console.log(`   OK. Blocked correctly: ${res.data.message}\n`);
    } else {
      console.log(`   FAIL. Expected 400 but got ${res.statusCode}\n`);
    }

    console.log("✅ ALL TESTS PASSED SUCCESSFULLY.");

  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("❌ VALIDATION FAILED:", JSON.stringify(error.errors, null, 2));
    } else {
      console.error("❌ TEST FAILED:", error);
    }
  } finally {
    // Clean up
    console.log("\nCleaning up...");
    // await Course.deleteMany({ instructorId: instructor._id });
    // await Category.deleteOne({ name: "Test Category" });
    // await User.deleteMany({ email: { $in: ["instructor@test.com", "admin@test.com"] } });
    await mongoose.connection.close();
    console.log("Done.");
  }
}

runTest();
