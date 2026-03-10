const authPaths = require("./authPaths");
const userPaths = require("./userPaths");
const coursePaths = require("./coursePaths");
const categoryPaths = require("./categoryPaths");
const enrollmentPaths = require("./enrollmentPaths");
const paymentPaths = require("./paymentPaths");
const imagePaths = require("./imagePaths");

const paths = {
  ...authPaths,
  ...userPaths,
  ...coursePaths,
  ...categoryPaths,
  ...enrollmentPaths,
  ...paymentPaths,
  ...imagePaths,
};

module.exports = paths;
