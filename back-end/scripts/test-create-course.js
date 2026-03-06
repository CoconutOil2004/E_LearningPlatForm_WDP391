/**
 * Script test API tạo course
 * - Đăng nhập với email/password → lấy token
 * - Lấy danh sách category (lấy categoryId)
 * - Gọi POST /api/courses để tạo course
 *
 * Chạy: node scripts/test-create-course.js
 * Hoặc: BASE_URL=http://localhost:9999 node scripts/test-create-course.js
 */

const axios = require("axios");

const BASE_URL = process.env.BASE_URL || "http://localhost:9999";

const EMAIL = "hoangtrieultvp@gmail.com";
const PASSWORD = "pass123";

// Dữ liệu course mẫu (có thể sửa khi chạy)
const COURSE_PAYLOAD = {
  title: "Khóa học test API - " + new Date().toISOString().slice(0, 10),
  description: "Mô tả khóa học được tạo từ script test API.",
  level: "Beginner", // Beginner | Intermediate | Advanced
  // categoryId sẽ lấy từ GET /api/categories (category đầu tiên)
};

async function main() {
  console.log("=== Test API tạo course ===\n");
  console.log("BASE_URL:", BASE_URL);
  console.log("Email:", EMAIL);
  console.log("---\n");

  try {
    // 1. Login
    console.log("1. Đăng nhập...");
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });

    const { token, user } = loginRes.data;
    if (!token) {
      throw new Error("Login không trả về token. Response: " + JSON.stringify(loginRes.data));
    }
    console.log("   OK. User:", user?.username || user?.email);
    console.log("   Token:", token.slice(0, 20) + "...\n");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 2. Lấy categories (để có categoryId)
    console.log("2. Lấy danh sách categories...");
    const catRes = await axios.get(`${BASE_URL}/api/categories`, { headers });
    const categories = catRes.data?.data || [];
    if (categories.length === 0) {
      throw new Error("Không có category nào. Hãy tạo category trước (DB hoặc script import).");
    }
    const categoryId = categories[0]._id;
    console.log("   OK. Dùng category đầu tiên:", categories[0].name, "(" + categoryId + ")\n");

    // 3. Tạo course
    const body = {
      ...COURSE_PAYLOAD,
      categoryId,
    };
    console.log("3. Tạo course...");
    console.log("   Body:", JSON.stringify(body, null, 2));
    const createRes = await axios.post(`${BASE_URL}/api/courses`, body, { headers });

    console.log("\n--- Kết quả ---");
    console.log("Status:", createRes.status);
    console.log("Response:", JSON.stringify(createRes.data, null, 2));
    console.log("\n✅ Test tạo course thành công.");
  } catch (err) {
    if (err.response) {
      console.error("\n❌ Lỗi API:", err.response.status, err.response.data);
    } else {
      console.error("\n❌ Lỗi:", err.message);
    }
    process.exit(1);
  }
}

main();
