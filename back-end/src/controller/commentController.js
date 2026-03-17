const { Comment, Enrollment, Course } = require("../models");
const logger = require("../utils/logger");

/**
 * Create a new comment for a lesson
 */
exports.createComment = async (req, res) => {
  try {
    const { courseId, lessonId, content, parentCommentId } = req.body;
    const userId = req.user.id;

    // 1. Verify enrollment or ownership
    const isInstructor = await Course.exists({ _id: courseId, instructorId: userId });
    const isEnrolled = await Enrollment.exists({ userId, courseId });
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isEnrolled && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to participate in discussions"
      });
    }

    // 2. Create comment
    const comment = await Comment.create({
      userId,
      courseId,
      lessonId,
      content,
      parentCommentId: parentCommentId || null
    });

    return res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error("Error creating comment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating comment"
    });
  }
};

/**
 * Get comments for a lesson
 */
exports.getLessonComments = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    // Fetch all comments for this lesson
    // Note: We'll do simple threading (one level deep) on the frontend or aggregate here
    const comments = await Comment.find({ lessonId })
      .populate("userId", "fullname avatarURL")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    logger.error("Error fetching comments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching comments"
    });
  }
};

/**
 * Delete a comment
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Only author or admin can delete
    if (comment.userId._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment"
      });
    }

    await Comment.findByIdAndDelete(id);
    
    // Also delete replies
    await Comment.deleteMany({ parentCommentId: id });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    logger.error("Error deleting comment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting comment"
    });
  }
};

/**
 * Get all comments (Admin only)
 */
exports.getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "fullname avatarURL")
        .populate("courseId", "title"),
      Comment.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    logger.error("Error fetching all comments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching comments"
    });
  }
};
