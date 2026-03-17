const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    instructorReply: {
      content: { type: String, trim: true },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Ensure a user can only review a course once
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
