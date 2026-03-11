const { BadRequest, Forbidden, ServerError } = require("../responses");
const {
  AuthRegisterRequest,
  AuthLoginRequest,
  AuthVerifyOtpRequest,
  AuthEmailRequest,
  AuthUpdateProfileRequest,
  AuthUpdatePasswordRequest,
} = require("../schemas");

const authPaths = {
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Đăng ký",
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthRegisterRequest" },
          },
        },
      },
      responses: {
        "200": { description: "Đăng ký thành công" },
        ...BadRequest,
        ...ServerError,
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
            schema: { $ref: "#/components/schemas/AuthLoginRequest" },
          },
        },
      },
      responses: {
        "200": { description: "success, token, user" },
        ...BadRequest,
        ...Forbidden,
        ...ServerError,
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
            schema: { $ref: "#/components/schemas/AuthVerifyOtpRequest" },
          },
        },
      },
      responses: {
        "200": { description: "OK" },
        ...BadRequest,
        ...ServerError,
      },
    },
  },
  "/api/auth/resend-otp": {
    post: {
      tags: ["Auth"],
      summary: "Gửi lại OTP",
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthEmailRequest" },
          },
        },
      },
      responses: {
        "200": { description: "OK" },
        ...BadRequest,
        ...ServerError,
      },
    },
  },
  "/api/auth/forgot-password": {
    post: {
      tags: ["Auth"],
      summary: "Quên mật khẩu",
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthEmailRequest" },
          },
        },
      },
      responses: {
        "200": { description: "OK" },
        ...BadRequest,
        ...ServerError,
      },
    },
  },
  "/api/auth/profile": {
    get: {
      tags: ["Auth"],
      summary: "Lấy profile (cần JWT)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "user" },
        ...Forbidden,
        ...ServerError,
      },
    },
    put: {
      tags: ["Auth"],
      summary: "Cập nhật profile (cần JWT)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthUpdateProfileRequest" },
          },
        },
      },
      responses: {
        "200": { description: "OK" },
        ...BadRequest,
        ...Forbidden,
        ...ServerError,
      },
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
            schema: { $ref: "#/components/schemas/AuthUpdatePasswordRequest" },
          },
        },
      },
      responses: {
        "200": { description: "OK" },
        ...BadRequest,
        ...Forbidden,
        ...ServerError,
      },
    },
  },
};

module.exports = authPaths;
