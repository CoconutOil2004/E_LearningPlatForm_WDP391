const mongoose = require("mongoose");
const { Review, Course, Enrollment, User } = require("../models");
const logger = require("../utils/logger");

/**
 * Create a new review for a course
 */
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, rating, comment } = req.body;

    if (!courseId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Course ID and rating are required",
      });
    }

    // 1. Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to leave a review",
      });
    }

    // 2. Check if user already reviewed
    const existingReview = await Review.findOne({ userId, courseId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    // 3. Create review
    const review = await Review.create({
      userId,
      courseId,
      rating,
      comment,
    });

    // 4. Recalculate course average rating
    const stats = await Review.aggregate([
      { $match: { courseId: review.courseId } },
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const newAverageRating = stats.length > 0 ? stats[0].averageRating : rating;

    // 5. Update course rating
    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal
    });

    logger.info(`New review added for course ${courseId} by user ${userId}. New rating: ${newAverageRating}`);

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    logger.error("Error creating review:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting review",
    });
  }
};

/**
 * Get all reviews for a course
 */
const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ courseId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "fullname avatarURL"),
      Review.countDocuments({ courseId }),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching course reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
    });
  }
};

/**
 * Get rating breakdown for a course (e.g., 5 stars: X%, 4 stars: Y%)
 */
const getCourseRatingStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    const stats = await Review.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize counts for all stars 1-5
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalReviews = 0;

    stats.forEach((s) => {
      breakdown[s._id] = s.count;
      totalReviews += s.count;
    });

    return res.status(200).json({
      success: true,
      stats: {
        breakdown,
        totalReviews,
      },
    });
  } catch (error) {
    logger.error("Error fetching rating stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching stats",
    });
  }
};

/**
 * Reply to a review (Instructor only)
 */
const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required",
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // 1. Verify that the user is the instructor of the course
    const course = await Course.findById(review.courseId);
    if (!course || (course.instructorId.toString() !== userId && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Only the instructor of this course can reply to this review",
      });
    }

    // 2. Add reply
    review.instructorReply = {
      content,
      repliedAt: new Date(),
    };

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      review,
    });
  } catch (error) {
    logger.error("Error replying to review:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while replying to review",
    });
  }
};

/**
 * Get all reviews (Admin only)
 */
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "fullname avatarURL")
        .populate("courseId", "title"),
      Review.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching all reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
    });
  }
};

/**
 * Delete a review (Admin or Author only)
 */
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check permissions: Admin or the student who wrote it
    if (review.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    const courseId = review.courseId;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate course average rating
    const stats = await Review.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const newAverageRating = stats.length > 0 ? stats[0].averageRating : 0;

    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(newAverageRating * 10) / 10,
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting review:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting review",
    });
  }
};

module.exports = {
  createReview,
  getCourseReviews,
  getCourseRatingStats,
  replyToReview,
  getAllReviews,
  deleteReview,
};
