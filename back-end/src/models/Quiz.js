const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: "At least 2 options required"
      }
    },
    correctAnswer: {
      type: String,
      required: true
    }
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true
    },

    questions: {
      type: [questionSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
