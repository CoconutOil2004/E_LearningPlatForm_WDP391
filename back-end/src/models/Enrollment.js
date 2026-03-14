const mongoose = require("mongoose");

/** Ngưỡng hoàn thành lesson: 30% thời lượng video (tích lũy watchedSeconds). */
const LESSON_COMPLETE_THRESHOLD = 0.3;

/* ================= ITEM PROGRESS (lesson: lock/progress/done + heartbeat; quiz: open/done) ================= */

const itemProgressSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    itemType: {
      type: String,
      enum: ["lesson", "quiz"],
      required: true
    },
    /** lesson: 'lock' | 'progress' | 'done'. quiz: 'open' | 'done' */
    status: {
      type: String,
      enum: ["lock", "progress", "done", "open"],
      required: true
    },
    /** Chỉ lesson: thời gian xem tích lũy (giây). */
    watchedSeconds: {
      type: Number,
      default: 0
    },
    /** Chỉ lesson: duration từ Lesson gốc lúc enroll (giây), để tính ngưỡng không cần query lại. */
    duration: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

/* ================= ENROLLMENT =================
   Proof of access after successful payment (BR-08).
   Progress % = completed lessons / total lessons (chỉ lesson, 30% duration = done).
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

    /** Tiến độ từng item (lesson + quiz). Lesson: lock/progress/done + watchedSeconds, duration. Quiz: open/done. */
    itemsProgress: {
      type: [itemProgressSchema],
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
module.exports.LESSON_COMPLETE_THRESHOLD = LESSON_COMPLETE_THRESHOLD;
