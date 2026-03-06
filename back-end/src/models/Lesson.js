const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    videoUrl: {
      type: String,
      default: null
    },

    videoPublicId: {
      type: String,
      default: null
    },

    duration: {
      type: Number,
      default: 0
    }, // seconds

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
