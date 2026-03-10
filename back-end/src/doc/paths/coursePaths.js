const { BadRequest, Forbidden, NotFound, ServerError } = require("../responses");
const { CreateCourseRequest } = require("../schemas");

const coursePaths = {
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
      responses: {
        "200": { description: "data, total, page, pages" },
        ...ServerError,
      },
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
      responses: {
        "200": { description: "data, pagination" },
        ...BadRequest,
        ...ServerError,
      },
    },
  },
  "/api/courses/levels": {
    get: {
      tags: ["Courses"],
      summary: "Danh sách level (Beginner, Intermediate, Advanced)",
      responses: {
        "200": { description: "data" },
        ...ServerError,
      },
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
            schema: { $ref: "#/components/schemas/CreateCourseRequest" },
          },
        },
      },
      responses: {
        "201": { description: "course" },
        ...BadRequest,
        ...Forbidden,
        ...ServerError,
      },
    },
  },
  "/api/courses/{courseId}": {
    put: {
      tags: ["Courses"],
      summary: "Cập nhật khóa học (Instructor)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: { type: "object" },
          },
        },
      },
      responses: {
        "200": { description: "OK" },
        ...BadRequest,
        ...NotFound,
        ...Forbidden,
        ...ServerError,
      },
    },
  },
  "/api/courses/{courseId}/submit": {
    put: {
      tags: ["Courses"],
      summary: "Submit khóa học duyệt (Instructor)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "OK" },
        ...NotFound,
        ...Forbidden,
        ...ServerError,
      },
    },
  },
  "/api/courses/admin/pending": {
    get: {
      tags: ["Courses"],
      summary: "Khóa học chờ duyệt (Admin)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "courses" },
        ...Forbidden,
        ...ServerError,
      },
    },
  },
  "/api/courses/{courseId}/approve": {
    put: {
      tags: ["Courses"],
      summary: "Duyệt khóa học (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "OK" },
        ...NotFound,
        ...Forbidden,
        ...ServerError,
      },
    },
  },
  "/api/courses/{courseId}/reject": {
    put: {
      tags: ["Courses"],
      summary: "Từ chối khóa học (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "OK" },
        ...NotFound,
        ...Forbidden,
        ...ServerError,
      },
    },
  },
  "/api/courses/{courseId}/lessons": {
    get: {
      tags: ["Courses"],
      summary: "Danh sách lessons (đã enroll)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "lessons" },
        ...NotFound,
        ...Forbidden,
        ...ServerError,
      },
    },
  },
};

module.exports = coursePaths;
