const express = require("express");
const router = express.Router();
const {
  createReview,
  getCourseReviews,
  getCourseRatingStats,
  replyToReview,
} = require("../controller/reviewController");
const { protect } = require("../middleware/auth.middleware");

// Public routes
router.get("/course/:courseId", getCourseReviews);
router.get("/course/:courseId/stats", getCourseRatingStats);

// Protected routes
router.post("/", protect, createReview);
router.post("/:reviewId/reply", protect, replyToReview);

// Admin global reviews
const { getAllReviews, deleteReview } = require("../controller/reviewController");
router.get("/admin/all", protect, getAllReviews);
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;
