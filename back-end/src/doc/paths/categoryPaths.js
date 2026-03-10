const { ServerError } = require("../responses");

const categoryPaths = {
  "/api/categories": {
    get: {
      tags: ["Categories"],
      summary: "Danh sách categories (public)",
      responses: {
        "200": { description: "categories" },
        ...ServerError,
      },
    },
  },
};

module.exports = categoryPaths;
