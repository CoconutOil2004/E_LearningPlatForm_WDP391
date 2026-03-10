const express = require("express");
const router = express.Router();

const {
  createBlog,
  updateOwnBlog,
  submitBlogForReview,
  manageBlogs,
  approveBlog,
  rejectBlog,
  softDeleteBlog,
  getBlogById,
} = require("../controller/blogController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authorize");

router.post(
  "/",
  protect,
  authorize("instructor"),
  createBlog
);

router.put(
  "/:id",
  protect,
  authorize("instructor"),
  updateOwnBlog
);

router.patch(
  "/:id/submit",
  protect,
  authorize("instructor"),
  submitBlogForReview
);

router.get(
  "/admin/manage",
  protect,
  authorize("admin"),
  manageBlogs
);

router.patch(
  "/admin/:id/approve",
  protect,
  authorize("admin"),
  approveBlog
);

router.patch(
  "/admin/:id/reject",
  protect,
  authorize("admin"),
  rejectBlog
);

router.delete(
  "/admin/:id",
  protect,
  authorize("admin"),
  softDeleteBlog
);

router.get(
  "/:id",
  protect,
  getBlogById
);

module.exports = router;