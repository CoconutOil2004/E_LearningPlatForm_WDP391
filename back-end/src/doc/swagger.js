/**
 * OpenAPI 3.0 - File tổng hợp tài liệu API
 * Truy cập: http://localhost:PORT/api-docs
 * Để test endpoint cần JWT: bấm "Authorize" → nhập token
 */

const paths = require("./paths");
const schemas = require("./schemas");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "WDP391 Backend API",
    version: "1.0.0",
    description: "REST API cho ứng dụng học trực tuyến. Dùng **Authorize** (JWT) để test các endpoint bảo vệ.",
  },
  servers: [
    { url: "/", description: "Same origin (dùng khi mở /api-docs trên cùng server)" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token từ POST /api/auth/login",
      },
    },
    schemas: {
      Error: schemas.Error,
      Pagination: schemas.Pagination,
      AuthRegisterRequest: schemas.AuthRegisterRequest,
      AuthLoginRequest: schemas.AuthLoginRequest,
      AuthVerifyOtpRequest: schemas.AuthVerifyOtpRequest,
      AuthEmailRequest: schemas.AuthEmailRequest,
      AuthUpdateProfileRequest: schemas.AuthUpdateProfileRequest,
      AuthUpdatePasswordRequest: schemas.AuthUpdatePasswordRequest,
      CreateInstructorRequest: schemas.CreateInstructorRequest,
      UpdateInstructorActionRequest: schemas.UpdateInstructorActionRequest,
      CreateCourseRequest: schemas.CreateCourseRequest,
      CompleteLessonRequest: schemas.CompleteLessonRequest,
      CreatePaymentRequest: schemas.CreatePaymentRequest,
      DeleteImageRequest: schemas.DeleteImageRequest,
    },
  },
  tags: [
    { name: "Auth", description: "Đăng ký, đăng nhập, OTP, profile" },
    { name: "Users", description: "Quản lý user (admin)" },
    { name: "Courses", description: "Khóa học" },
    { name: "Categories", description: "Danh mục" },
    { name: "Enrollments", description: "Khóa học của tôi" },
    { name: "Payments", description: "Thanh toán" },
    { name: "Images", description: "Upload ảnh" },
  ],
  paths,
};

module.exports = swaggerDocument;
