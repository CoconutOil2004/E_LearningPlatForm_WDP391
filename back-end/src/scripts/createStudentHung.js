const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", "..", ".env"),
});

const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  try {
    await connectDB();

    const email = "hungtd2k4@gmail.com";
    const password = "Hung@123";

    let user = await User.findOne({ email });

    if (user) {
      console.log("User already exists with this email:", email);
    } else {
      user = new User({
        username: "hungtd2k4",
        fullname: "Student Hung",
        email,
        password,
        role: "student",
        isVerified: true,
      });

      await user.save();
      console.log("Student user created with email:", email);
    }
  } catch (err) {
    console.error("Error creating student user:", err);
  } finally {
    process.exit(0);
  }
};

run();
