const mongoose = require("mongoose");

/* ================= LESSON PROGRESS ================= */

const lessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true,
    index: true
  },

  completed: {
    type: Boolean,
    default: false
  },

  watchedSeconds: {
    type: Number,
    default: 0
  },

  lastWatchedAt: {
    type: Date,
    default: Date.now
  }

}, { _id: false });

/* ================= ENROLLMENT ================= */

const enrollmentSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  enrollmentDate: {
    type: Date,
    default: Date.now
  },

  /* AUTO CALCULATED */
  progress: {
    type: Number,
    default: 0
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
    index: true
  },

  completed: {
    type: Boolean,
    default: false
  },

  /* ⭐ REAL UDEMY LOGIC */
  lessonsProgress: {
    type: [lessonProgressSchema],
    default: []
  }

}, { timestamps: true });

/* prevent duplicate purchase */
enrollmentSchema.index(
  { userId: 1, courseId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);