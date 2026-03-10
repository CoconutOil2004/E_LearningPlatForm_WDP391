const { BadRequest, ServerError } = require("../responses");
const { DeleteImageRequest } = require("../schemas");

const imagePaths = {
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
      responses: {
        "200": { description: "url" },
        ...BadRequest,
        ...ServerError,
      },
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
      responses: {
        "200": { description: "urls" },
        ...BadRequest,
        ...ServerError,
      },
    },
  },
  "/api/images/delete": {
    delete: {
      tags: ["Images"],
      summary: "Xóa ảnh",
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/DeleteImageRequest" },
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
};

module.exports = imagePaths;
