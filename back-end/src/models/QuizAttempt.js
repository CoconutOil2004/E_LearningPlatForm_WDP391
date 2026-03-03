const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz"
  },

  submittedAt: Date,
  score: Number

}, { timestamps: true });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
