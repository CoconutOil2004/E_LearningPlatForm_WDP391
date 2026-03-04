const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    // Trim để loại bỏ khoảng trắng thừa
    const dbName = (process.env.DB_NAME || "E_Learning").trim();

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Xử lý connection string: thêm database name vào URI nếu chưa có
    let connectionString;
    if (mongoUri.includes("/?")) {
      // Nếu URI có query string, thêm database name trước dấu ?
      connectionString = mongoUri.replace("/?", `/${dbName}?`);
    } else if (mongoUri.endsWith("/")) {
      // Nếu URI kết thúc bằng /, thêm database name
      connectionString = `${mongoUri}${dbName}`;
    } else {
      // Trường hợp còn lại, thêm / và database name
      connectionString = `${mongoUri}/${dbName}`;
    }

    await mongoose.connect(connectionString, {
      // Options cho MongoDB Atlas
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Atlas connected to database: ${dbName}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
