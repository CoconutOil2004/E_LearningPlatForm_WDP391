/**
 * Script test API upload ảnh / video
 * - Đăng nhập với email/password → lấy token
 * - POST /api/upload/images với file ảnh (field: images)
 * - (Tùy chọn) POST /api/upload/video với file video
 *
 * Chạy từ thư mục back-end:
 *   node scripts/test-upload-api.js
 *
 * Hoặc chỉ định BASE_URL / file ảnh:
 *   BASE_URL=http://localhost:9999 node scripts/test-upload-api.js
 */

const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

// Load .env từ thư mục back-end (khi chạy node scripts/test-upload-api.js)
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const BASE_URL = process.env.BASE_URL || "http://localhost:9999";

// Tài khoản test – instructor (có thể đổi hoặc lấy từ .env)
const EMAIL = process.env.TEST_EMAIL || "instructor@gmail.com";
const PASSWORD = process.env.TEST_PASSWORD || "abc@123";

// File ảnh mặc định: testJson/docs/Screenshot 2026-03-13 000629.png
const DEFAULT_IMAGE_PATH = path.join(
  __dirname,
  "..",
  "testJson",
  "docs",
  "Screenshot 2026-03-13 000629.png"
);

const IMAGE_PATH = process.env.TEST_IMAGE_PATH || DEFAULT_IMAGE_PATH;

async function main() {
  console.log("=== Test API Upload (images) ===\n");
  console.log("BASE_URL:", BASE_URL);
  console.log("Email:", EMAIL);
  console.log("File ảnh:", IMAGE_PATH);
  console.log("---\n");

  if (!fs.existsSync(IMAGE_PATH)) {
    console.error("❌ Không tìm thấy file ảnh:", IMAGE_PATH);
    console.error("   Tạo file hoặc set TEST_IMAGE_PATH=đường/dẫn/ảnh.png");
    process.exit(1);
  }

  try {
    // 1. Login
    console.log("1. Đăng nhập...");
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });

    const { token, user } = loginRes.data;
    if (!token) {
      throw new Error(
        "Login không trả về token. Response: " + JSON.stringify(loginRes.data)
      );
    }
    console.log("   OK. User:", user?.username || user?.email);
    console.log("   Token:", token.slice(0, 20) + "...\n");

    // 2. Upload images (multipart, field: images)
    console.log("2. Upload ảnh POST /api/upload/images ...");
    const form = new FormData();
    form.append("images", fs.createReadStream(IMAGE_PATH), {
      filename: path.basename(IMAGE_PATH),
      contentType: "image/png",
    });

    const uploadRes = await axios.post(
      `${BASE_URL}/api/upload/images`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    console.log("\n--- Kết quả upload ảnh ---");
    console.log("Status:", uploadRes.status);
    console.log("Response:", JSON.stringify(uploadRes.data, null, 2));
    if (uploadRes.data?.success && uploadRes.data?.data?.length) {
      console.log("\nURL ảnh:", uploadRes.data.data[0].url);
      console.log("publicId:", uploadRes.data.data[0].publicId);
    }
    console.log("\n✅ Test upload images thành công.");
  } catch (err) {
    if (err.response) {
      console.error(
        "\n❌ Lỗi API:",
        err.response.status,
        err.response.data
      );
    } else {
      console.error("\n❌ Lỗi:", err.message);
    }
    process.exit(1);
  }
}

main();
