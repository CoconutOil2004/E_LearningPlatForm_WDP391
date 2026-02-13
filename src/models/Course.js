const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  lessonId: String,
  title: String,
  videoUrl: String
});

const courseSchema = new mongoose.Schema({
  courseId: String,
  title: String,
  description: String,
  price: Number,
  status: String,

  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  lessons: [lessonSchema]

}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
