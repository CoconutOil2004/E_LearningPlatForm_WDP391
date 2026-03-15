const express = require("express");
const router = express.Router();
const {
  createReview,
  getCourseReviews,
  getCourseRatingStats,
  replyToReview,
} = require("../controller/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/course/:courseId", getCourseReviews);
router.get("/course/:courseId/stats", getCourseRatingStats);

// Protected routes
router.post("/", protect, createReview);
router.post("/:reviewId/reply", protect, replyToReview);

module.exports = router;
