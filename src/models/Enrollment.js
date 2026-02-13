const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  enrollmentDate: {
    type: Date,
    default: Date.now
  },

  progress: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
