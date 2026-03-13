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
    description:
      "REST API cho ứng dụng học trực tuyến. Dùng **Authorize** (JWT) để test các endpoint bảo vệ.",
  },
  servers: [
    {
      url: "/",
      description: "Same origin (dùng khi mở /api-docs trên cùng server)",
    },
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

      Blog: {
        type: "object",
        properties: {
          _id: { type: "string", example: "67dabc1234567890abcd1234" },
          title: {
            type: "string",
            example: "Hướng dẫn học Node.js cho người mới",
          },
          summary: {
            type: "string",
            example:
              "Bài viết giới thiệu lộ trình học Node.js từ cơ bản đến nâng cao.",
          },
          category: {
            type: "string",
            example: "67dabc1234567890abcd9999",
          },
          status: {
            type: "string",
            enum: ["draft", "pending", "approved", "rejected"],
            example: "draft",
          },
          content: {
            type: "string",
            example: "<p>Nội dung bài viết...</p>",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      UpdateBlogRequest: {
        type: "object",
        required: ["title", "summary", "category", "content"],
        properties: {
          title: { type: "string", example: "Tiêu đề bài viết mới" },
          summary: {
            type: "string",
            example: "Tóm tắt mới cho bài viết.",
          },
          category: {
            type: "string",
            example: "67dabc1234567890abcd9999",
          },
          status: {
            type: "string",
            enum: ["draft", "pending", "approved", "rejected"],
            example: "draft",
          },
          content: {
            type: "string",
            example: "<p>Nội dung mới...</p>",
          },
        },
      },

      RejectBlogRequest: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            example:
              "Bài viết cần chỉnh lại nội dung hoặc bổ sung thêm thông tin.",
          },
        },
      },

      BlogListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "Lấy danh sách quản lý bài viết thành công.",
          },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Blog" },
          },
          pagination: {
            type: "object",
            properties: {
              currentPage: { type: "integer", example: 1 },
              totalPages: { type: "integer", example: 3 },
              totalItems: { type: "integer", example: 25 },
              pageSize: { type: "integer", example: 10 },
            },
          },
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
    { name: "Payments", description: "Thanh toán & thống kê doanh thu" },
    { name: "Images", description: "Upload ảnh" },
    { name: "Blogs", description: "Quản lý bài viết" },
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
        responses: {
          "200": { description: "OK" },
          "400": { description: "Bad request" },
        },
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
        responses: {
          "200": { description: "success, token, user" },
          "400": { description: "Sai email/password" },
          "403": {
            description: "Chưa verify OTP hoặc tài khoản bị khóa",
          },
        },
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
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["action"],
                properties: {
                  action: {
                    type: "string",
                    enum: ["lock", "unlock"],
                  },
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
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { "200": { description: "users" } },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Chi tiết user theo ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
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
          {
            name: "category",
            in: "query",
            description: "Category ID",
            schema: { type: "string" },
          },
          {
            name: "level",
            in: "query",
            schema: {
              type: "string",
              enum: ["Beginner", "Intermediate", "Advanced"],
            },
          },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "minRating", in: "query", schema: { type: "number" } },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["priceAsc", "priceDesc", "rating", "popular"],
            },
          },
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
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["priceAsc", "priceDesc", "rating", "popular"],
            },
          },
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
                  level: {
                    type: "string",
                    enum: ["Beginner", "Intermediate", "Advanced"],
                  },
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
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/courses/{courseId}/submit": {
      put: {
        tags: ["Courses"],
        summary: "Submit khóa học duyệt (Instructor)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
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
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/courses/{courseId}/reject": {
      put: {
        tags: ["Courses"],
        summary: "Từ chối khóa học (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/courses/{courseId}/lessons": {
      get: {
        tags: ["Courses"],
        summary: "Danh sách lessons (đã enroll)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
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
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
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
                required: ["courseId"],
                properties: {
                  courseId: { type: "string" },
                  paymentMethod: {
                    type: "string",
                    enum: ["vnpay"],
                    example: "vnpay",
                  },
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

    "/api/payments/admin/revenue/summary": {
      get: {
        tags: ["Payments"],
        summary: "Tổng doanh thu trong khoảng thời gian (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date-time" },
            required: false,
            description: "Ngày bắt đầu (ISO string), vd 2024-01-01",
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date-time" },
            required: false,
            description: "Ngày kết thúc (ISO string)",
          },
        ],
        responses: {
          "200": {
            description: "Tổng doanh thu và số đơn",
          },
        },
      },
    },

    "/api/payments/admin/revenue/daily": {
      get: {
        tags: ["Payments"],
        summary: "Doanh thu theo ngày/tháng (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            name: "groupBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["day", "month"],
              default: "day",
            },
            required: false,
          },
        ],
        responses: {
          "200": {
            description: "Danh sách doanh thu theo mốc thời gian",
          },
        },
      },
    },

    "/api/payments/admin/revenue/by-course": {
      get: {
        tags: ["Payments"],
        summary: "Doanh thu theo khóa học (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
        ],
        responses: {
          "200": {
            description: "Danh sách doanh thu theo từng khóa học",
          },
        },
      },
    },

    /* ========== UPLOAD (Cloudinary: ảnh + video) ========== */
    "/api/upload/images": {
      post: {
        tags: ["Upload"],
        summary: "Upload nhiều ảnh (multipart, field: images, tối đa 10)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
        },
        responses: { "200": { description: "data: [ { url, publicId }, ... ]" } },
      },
    },
    "/api/upload/video": {
      post: {
        tags: ["Upload"],
        summary: "Upload 1 video (multipart, field: video)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  video: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },

    /* ========== BLOGS ========== */
    "/api/blogs/{id}": {
      put: {
        tags: ["Blogs"],
        summary: "Cập nhật bài viết (Instructor)",
        description:
          "Instructor chỉ được cập nhật bài viết do chính mình tạo và chưa bị xóa mềm.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID bài viết",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateBlogRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Cập nhật bài viết thành công" },
          "404": { description: "Không tìm thấy bài viết" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/blogs/{id}/submit": {
      patch: {
        tags: ["Blogs"],
        summary: "Gửi bài viết chờ duyệt (Instructor)",
        description:
          "Instructor gửi bài viết từ draft hoặc rejected sang pending để admin duyệt.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID bài viết",
          },
        ],
        responses: {
          "200": { description: "Đã gửi bài viết chờ duyệt" },
          "400": {
            description: "Bài viết chưa đủ thông tin để gửi duyệt",
          },
          "404": { description: "Không tìm thấy bài viết" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/blogs/admin/manage": {
      get: {
        tags: ["Blogs"],
        summary: "Quản lý bài viết (Admin)",
        description:
          "Admin xem danh sách toàn bộ bài viết và lọc theo trạng thái, danh mục, tác giả, từ khóa, trạng thái xóa mềm.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", example: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", example: 10 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", example: "node js" },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["draft", "pending", "approved", "rejected"],
            },
          },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "author", in: "query", schema: { type: "string" } },
          {
            name: "deleted",
            in: "query",
            schema: { type: "boolean", example: false },
          },
        ],
        responses: {
          "200": {
            description: "Danh sách bài viết",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BlogListResponse" },
              },
            },
          },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/blogs/admin/{id}/approve": {
      patch: {
        tags: ["Blogs"],
        summary: "Duyệt bài viết (Admin)",
        description: "Admin duyệt bài viết đang ở trạng thái pending.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID bài viết",
          },
        ],
        responses: {
          "200": { description: "Duyệt bài viết thành công" },
          "400": { description: "Bài viết không ở trạng thái pending" },
          "404": { description: "Không tìm thấy bài viết" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/blogs/admin/{id}/reject": {
      patch: {
        tags: ["Blogs"],
        summary: "Từ chối bài viết (Admin)",
        description: "Admin từ chối bài viết đang ở trạng thái pending.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID bài viết",
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RejectBlogRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Từ chối bài viết thành công" },
          "400": { description: "Bài viết không ở trạng thái pending" },
          "404": { description: "Không tìm thấy bài viết" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/blogs/admin/{id}": {
      delete: {
        tags: ["Blogs"],
        summary: "Xóa mềm bài viết (Admin)",
        description:
          "Admin xóa mềm bài viết bằng cách cập nhật deleted = true.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID bài viết",
          },
        ],
        responses: {
          "200": { description: "Xóa mềm bài viết thành công" },
          "404": { description: "Không tìm thấy bài viết" },
          "500": { description: "Server error" },
        },
      },
    },
  },
};

module.exports = swaggerDocument;