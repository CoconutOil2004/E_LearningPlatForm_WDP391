/**
 * Response dùng chung cho các endpoint (lỗi)
 */

const BadRequest = {
  "400": {
    description: "Bad request - Dữ liệu không hợp lệ",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
};

const Unauthorized = {
  "401": {
    description: "Unauthorized - Chưa đăng nhập",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
};

const Forbidden = {
  "403": {
    description: "Forbidden - Không có quyền truy cập",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
};

const NotFound = {
  "404": {
    description: "Not found - Không tìm thấy",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
};

const ServerError = {
  "500": {
    description: "Server error - Lỗi máy chủ",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
};

/** Merge nhiều response objects */
function mergeResponses(...responses) {
  return Object.assign({}, ...responses);
}

module.exports = {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  ServerError,
  mergeResponses,
};
