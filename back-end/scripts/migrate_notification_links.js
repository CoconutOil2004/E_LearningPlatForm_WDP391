const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Notification = require("../src/models/Notification");

async function migrate() {
  try {
    await connectDB();
    
    // Find notifications that start with /learning/ (incorrect)
    // and prepend /student
    const result = await Notification.updateMany(
      { link: { $regex: /^\/learning\// } },
      [
        {
          $set: {
            link: {
              $concat: ["/student", "$link"]
            }
          }
        }
      ]
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} legacy notification links.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
