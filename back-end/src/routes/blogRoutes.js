const express = require("express");
const router = express.Router();

const {
  // Public
  getPublicBlogs,
  getPublicBlogById,
  // Instructor
  createBlog,
  updateOwnBlog,
  submitBlogForReview,
  deleteOwnBlog,
  getMyBlogs,
  // Admin
  manageBlogs,
  approveBlog,
  rejectBlog,
  softDeleteBlog,
  restoreBlog,
  getBlogById,
} = require("../controller/blogController");

const { protect, isAdmin, authorize } = require('../middleware/auth.middleware');
const { validate } = require("../middleware/validation.middleware");
const { createBlogValidation, updateBlogValidation } = require("../validations/blog.validation");

// ─── PUBLIC (không cần auth) ──────────────────────────────────────────────────
router.get("/public", getPublicBlogs);
router.get("/public/:id", getPublicBlogById);

// ─── INSTRUCTOR ───────────────────────────────────────────────────────────────
router.post("/", protect, authorize("instructor"), createBlogValidation, validate, createBlog);
router.get("/my", protect, authorize("instructor"), getMyBlogs);
router.put("/:id", protect, authorize("instructor"), updateBlogValidation, validate, updateOwnBlog);
router.patch("/:id/submit", protect, authorize("instructor"), submitBlogForReview);
router.delete("/:id", protect, authorize("instructor"), deleteOwnBlog);

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.get("/admin/manage", protect, authorize("admin"), manageBlogs);
router.patch("/admin/:id/approve", protect, authorize("admin"), approveBlog);
router.patch("/admin/:id/reject", protect, authorize("admin"), rejectBlog);
router.delete("/admin/:id", protect, authorize("admin"), softDeleteBlog);
router.patch("/admin/:id/restore", protect, authorize("admin"), restoreBlog);

// ─── PROTECTED (auth required) ────────────────────────────────────────────────
router.get("/:id", protect, getBlogById);

module.exports = router;