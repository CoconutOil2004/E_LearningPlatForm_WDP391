/**
 * Schemas dùng chung cho request/response trong OpenAPI
 */

const Error = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string" },
  },
};

const Pagination = {
  type: "object",
  properties: {
    page: { type: "integer" },
    limit: { type: "integer" },
    total: { type: "integer" },
    totalPages: { type: "integer" },
  },
};

/* ========== AUTH ========== */
const AuthRegisterRequest = {
  type: "object",
  required: ["email", "password", "fullname"],
  properties: {
    email: { type: "string", example: "user@example.com" },
    password: { type: "string", example: "123456" },
    fullname: { type: "string", example: "Nguyen Van A" },
  },
};

const AuthLoginRequest = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string" },
    password: { type: "string" },
  },
};

const AuthVerifyOtpRequest = {
  type: "object",
  properties: {
    email: { type: "string" },
    otp: { type: "string" },
  },
};

const AuthEmailRequest = {
  type: "object",
  properties: {
    email: { type: "string" },
  },
};

const AuthUpdateProfileRequest = {
  type: "object",
  properties: {
    fullname: { type: "string" },
    avatarURL: { type: "string" },
  },
};

const AuthUpdatePasswordRequest = {
  type: "object",
  properties: {
    currentPassword: { type: "string" },
    newPassword: { type: "string" },
  },
};

/* ========== USERS ========== */
const CreateInstructorRequest = {
  type: "object",
  required: ["email"],
  properties: {
    email: { type: "string" },
    fullname: { type: "string" },
  },
};

const UpdateInstructorActionRequest = {
  type: "object",
  required: ["action"],
  properties: {
    action: { type: "string", enum: ["lock", "unlock"] },
  },
};

/* ========== COURSES ========== */
const CreateCourseRequest = {
  type: "object",
  required: ["title", "categoryId", "level"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    categoryId: { type: "string" },
    level: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
  },
};

const CompleteLessonRequest = {
  type: "object",
  properties: {
    lessonId: { type: "string" },
  },
};

const CreatePaymentRequest = {
  type: "object",
  properties: {
    courseId: { type: "string" },
    amount: { type: "number" },
  },
};

const DeleteImageRequest = {
  type: "object",
  properties: {
    publicId: { type: "string" },
  },
};

module.exports = {
  Error,
  Pagination,
  AuthRegisterRequest,
  AuthLoginRequest,
  AuthVerifyOtpRequest,
  AuthEmailRequest,
  AuthUpdateProfileRequest,
  AuthUpdatePasswordRequest,
  CreateInstructorRequest,
  UpdateInstructorActionRequest,
  CreateCourseRequest,
  CompleteLessonRequest,
  CreatePaymentRequest,
  DeleteImageRequest,
};
