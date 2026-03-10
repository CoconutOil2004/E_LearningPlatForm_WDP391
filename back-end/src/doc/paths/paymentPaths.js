const { BadRequest, Forbidden, ServerError } = require("../responses");
const { CreatePaymentRequest } = require("../schemas");

const paymentPaths = {
  "/api/payments/create": {
    post: {
      tags: ["Payments"],
      summary: "Tạo thanh toán",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreatePaymentRequest" },
          },
        },
      },
      responses: {
        "200": { description: "payment url / data" },
        ...BadRequest,
        ...Forbidden,
        ...ServerError,
      },
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
      responses: {
        "200": { description: "redirect" },
        ...ServerError,
      },
    },
  },
  "/api/payments/my": {
    get: {
      tags: ["Payments"],
      summary: "Lịch sử thanh toán của tôi",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "payments" },
        ...Forbidden,
        ...ServerError,
      },
    },
  },
};

module.exports = paymentPaths;
