/**
 * OpenAPI 3.0 spec cho Swagger UI
 * Truy cập: http://localhost:PORT/api-docs
 * Để test endpoint cần JWT: bấm "Authorize" → nhập token (hoặc Bearer <token>)
 */

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
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
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
  paths: {
    /* ========== AUTH ========== */
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Đăng ký",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "fullname"],
                properties: {
                  email: { type: "string", example: "user@example.com" },
                  password: { type: "string", example: "123456" },
                  fullname: { type: "string", example: "Nguyen Van A" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" }, "400": { description: "Bad request" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Đăng nhập (trả về token dùng cho Authorize)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "success, token, user" }, "400": { description: "Sai email/password" }, "403": { description: "Chưa verify OTP hoặc tài khoản bị khóa" } },
      },
    },
    "/api/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Xác thực OTP",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  otp: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/auth/resend-otp": {
      post: {
        tags: ["Auth"],
        summary: "Gửi lại OTP",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" } } } } } },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/auth/forgot-password": {  
      post: {
        tags: ["Auth"],
        summary: "Quên mật khẩu",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Lấy profile (cần JWT)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "user" } },
      },
      put: {
        tags: ["Auth"],
        summary: "Cập nhật profile (cần JWT)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullname: { type: "string" },
                  avatarURL: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/auth/password": {
      put: {
        tags: ["Auth"],
        summary: "Đổi mật khẩu (cần JWT)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },

    /* ========== USERS (Admin) ========== */
    "/api/users/students": {
      get: {
        tags: ["Users"],
        summary: "Danh sách student (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "students, pagination" } },
      },
    },
    "/api/users/instructors": {
      get: {
        tags: ["Users"],
        summary: "Danh sách instructor (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "instructors, pagination" } },
      },
      post: {
        tags: ["Users"],
        summary: "Tạo instructor (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string" },
                  fullname: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "instructor created" } },
      },
    },
    "/api/users/instructors/{id}/action": {
      patch: {
        tags: ["Users"],
        summary: "Lock/Unlock instructor (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["action"],
                properties: {
                  action: { type: "string", enum: ["lock", "unlock"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/users/search": {
      get: {
        tags: ["Users"],
        summary: "Tìm user (cần JWT)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "query", in: "query", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "users" } },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Chi tiết user theo ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "user" } },
      },
    },

    /* ========== COURSES ========== */
    "/api/courses/search": {
      get: {
        tags: ["Courses"],
        summary: "Tìm kiếm khóa học (public)",
        parameters: [
          { name: "keyword", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", description: "Category ID", schema: { type: "string" } },
          { name: "level", in: "query", schema: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "minRating", in: "query", schema: { type: "number" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["priceAsc", "priceDesc", "rating", "popular"] } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "data, total, page, pages" } },
      },
    },
    "/api/courses/by-category/{categoryId}": {
      get: {
        tags: ["Courses"],
        summary: "Danh sách khóa học theo category (public)",
        parameters: [
          { name: "categoryId", in: "path", required: true, schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["priceAsc", "priceDesc", "rating", "popular"] } },
        ],
        responses: { "200": { description: "data, pagination" } },
      },
    },
    "/api/courses/levels": {
      get: {
        tags: ["Courses"],
        summary: "Danh sách level (Beginner, Intermediate, Advanced)",
        responses: { "200": { description: "data" } },
      },
    },
    "/api/courses": {
      post: {
        tags: ["Courses"],
        summary: "Tạo khóa học (Instructor)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "categoryId", "level"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  categoryId: { type: "string" },
                  level: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
                },
              },
            },
          },
        },
        responses: { "201": { description: "course" } },
      },
    },
    "/api/courses/{courseId}": {
      put: {
        tags: ["Courses"],
        summary: "Cập nhật khóa học (Instructor)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/courses/{courseId}/submit": {
      put: {
        tags: ["Courses"],
        summary: "Submit khóa học duyệt (Instructor)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/courses/admin/pending": {
      get: {
        tags: ["Courses"],
        summary: "Khóa học chờ duyệt (Admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "courses" } },
      },
    },
    "/api/courses/{courseId}/approve": {
      put: {
        tags: ["Courses"],
        summary: "Duyệt khóa học (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/courses/{courseId}/reject": {
      put: {
        tags: ["Courses"],
        summary: "Từ chối khóa học (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/courses/{courseId}/lessons": {
      get: {
        tags: ["Courses"],
        summary: "Danh sách lessons (đã enroll)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "lessons" } },
      },
    },

    /* ========== CATEGORIES ========== */
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Danh sách categories (public)",
        responses: { "200": { description: "categories" } },
      },
    },

    /* ========== ENROLLMENTS ========== */
    "/api/enrollments/my-courses": {
      get: {
        tags: ["Enrollments"],
        summary: "Khóa học đã mua của tôi",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "courses" } },
      },
    },
    "/api/enrollments/{courseId}/complete-lesson": {
      post: {
        tags: ["Enrollments"],
        summary: "Đánh dấu hoàn thành lesson",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  lessonId: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },

    /* ========== PAYMENTS ========== */
    "/api/payments/create": {
      post: {
        tags: ["Payments"],
        summary: "Tạo thanh toán",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  courseId: { type: "string" },
                  amount: { type: "number" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "payment url / data" } },
      },
    },
    "/api/payments/callback": {
      get: {
        tags: ["Payments"],
        summary: "Callback sau thanh toán (PayPal/...)",
        parameters: [
          { name: "token", in: "query", schema: { type: "string" } },
          { name: "PayerID", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "redirect" } },
      },
    },
    "/api/payments/my": {
      get: {
        tags: ["Payments"],
        summary: "Lịch sử thanh toán của tôi",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "payments" } },
      },
    },

    /* ========== IMAGES ========== */
    "/api/images/upload": {
      post: {
        tags: ["Images"],
        summary: "Upload 1 ảnh (multipart/form-data, field: image)",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "url" } },
      },
    },
    "/api/images/upload-multiple": {
      post: {
        tags: ["Images"],
        summary: "Upload nhiều ảnh (field: images)",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  images: { type: "array", items: { type: "string", format: "binary" } },
                },
              },
            },
          },
        },
        responses: { "200": { description: "urls" } },
      },
    },
    "/api/images/delete": {
      delete: {
        tags: ["Images"],
        summary: "Xóa ảnh",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  publicId: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
  },
};

module.exports = swaggerDocument;
