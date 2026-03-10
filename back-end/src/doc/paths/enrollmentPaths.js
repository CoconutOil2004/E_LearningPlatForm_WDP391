const { BadRequest, Forbidden, NotFound, ServerError } = require("../responses");
const { CompleteLessonRequest } = require("../schemas");

const enrollmentPaths = {
  "/api/enrollments/my-courses": {
    get: {
      tags: ["Enrollments"],
      summary: "Khóa học đã mua của tôi",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "courses" },
        ...Forbidden,
        ...ServerError,
      },
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
            schema: { $ref: "#/components/schemas/CompleteLessonRequest" },
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
};

module.exports = enrollmentPaths;
