const express = require("express");
const router = express.Router();
const {
  createReview,
  getCourseReviews,
  getCourseRatingStats,
  getMyReview,
  replyToReview,
} = require("../controller/reviewController");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createReviewValidation, replyReviewValidation } = require("../validations/review.validation");

// Public routes
router.get("/course/:courseId", getCourseReviews);
router.get("/course/:courseId/stats", getCourseRatingStats);

// Protected routes
router.post("/", protect, createReviewValidation, validate, createReview);
router.get("/my-review/:courseId", protect, getMyReview);
router.post("/:reviewId/reply", protect, replyReviewValidation, validate, replyToReview);

// Admin global reviews
const { getAllReviews, deleteReview } = require("../controller/reviewController");
router.get("/admin/all", protect, getAllReviews);
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;
