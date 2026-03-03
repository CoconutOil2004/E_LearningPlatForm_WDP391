const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true
  },

  videoUrl: String,
  videoPublicId: String,

  order: {
    type: Number,
    required: true
  },

  duration: Number // (seconds)
});

const courseSchema = new mongoose.Schema({

  courseId: {
    type: String,
    required: true,
    unique: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  price: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft"
  },

  thumbnail: String,

  //  NEW SEARCH FILTER FIELDS
  category: {
    type: String,
    index: true
  },

  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    index: true
  },

  language: {
    type: String,
    default: "Vietnamese"
  },

  rating: {
    type: Number,
    default: 0
  },

  enrollmentCount: {
    type: Number,
    default: 0
  },

  totalDuration: {
    type: Number,
    default: 0 // seconds
  },

  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  lessons: [lessonSchema]

}, { timestamps: true });

/* =======================
   INDEX SEARCH
======================= */

courseSchema.index({
  title: "text",
  description: "text"
});

courseSchema.index({ price: 1 });
courseSchema.index({ rating: -1 });

module.exports = mongoose.model("Course", courseSchema);
