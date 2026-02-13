const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  quizId: String,
  title: String,
  googleFormUrl: String,

  lessonId: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  }

}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);
