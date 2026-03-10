const { BadRequest, Forbidden, NotFound, ServerError } = require("../responses");
const { CreateInstructorRequest, UpdateInstructorActionRequest } = require("../schemas");

const userPaths = {
  "/api/users/students": {
    get: {
      tags: ["Users"],
      summary: "Danh sách student (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "integer" } },
        { name: "limit", in: "query", schema: { type: "integer" } },
      ],
      responses: {
        "200": { description: "students, pagination" },
        ...Forbidden,
        ...ServerError,
      },
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
      responses: {
        "200": { description: "instructors, pagination" },
        ...Forbidden,
        ...ServerError,
      },
    },
    post: {
      tags: ["Users"],
      summary: "Tạo instructor (Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateInstructorRequest" },
          },
        },
      },
      responses: {
        "201": { description: "instructor created" },
        ...BadRequest,
        ...Forbidden,
        ...ServerError,
      },
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
            schema: { $ref: "#/components/schemas/UpdateInstructorActionRequest" },
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
  "/api/users/search": {
    get: {
      tags: ["Users"],
      summary: "Tìm user (cần JWT)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "query", in: "query", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "users" },
        ...BadRequest,
        ...Forbidden,
        ...ServerError,
      },
    },
  },
  "/api/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Chi tiết user theo ID",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "user" },
        ...NotFound,
        ...Forbidden,
        ...ServerError,
      },
    },
  },
};

module.exports = userPaths;
