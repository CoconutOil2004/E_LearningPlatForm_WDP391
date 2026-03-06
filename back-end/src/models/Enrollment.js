const mongoose = require("mongoose");

/* ================= LESSON PROGRESS (only Lessons count for progress %) ================= */

const lessonProgressSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
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
  },
  { _id: false }
);

/* ================= ENROLLMENT =================
   Proof of access after successful payment (BR-08).
   Only created when Order status becomes 'paid'.
   Progress % = completed lessons / total lessons (Quizzes ignored).
*/

const enrollmentSchema = new mongoose.Schema(
  {
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

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "paid",
      index: true
    },

    completed: {
      type: Boolean,
      default: false
    },

    lessonsProgress: {
      type: [lessonProgressSchema],
      default: []
    }
  },
  { timestamps: true }
);

enrollmentSchema.index(
  { userId: 1, courseId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
