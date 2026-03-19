const mongoose = require("mongoose");

/* ================= SECTION > ITEMS (Lesson or Quiz) ================= */

const sectionItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["lesson", "quiz"],
      required: true,
    },
    itemRef: {
      type: String,
      enum: ["Lesson", "Quiz"],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "sections.items.itemRef",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    orderIndex: {
      type: Number,
      required: true,
    },
  },
  { _id: true },
);

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [sectionItemSchema],
      default: [],
    },
  },
  { _id: true },
);

/* ================= COURSE ================= */

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      validate: {
        validator: (v) => v >= 0,
        message: "Price must be >= 0",
      },
    },

    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
    },

    thumbnail: String,

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      index: true,
    },

    /* Hiển thị ngôn ngữ khóa học. Dùng "none" để tránh lỗi text index (MongoDB không hỗ trợ Vietnamese). */
    language: {
      type: String,
      default: "none",
    },

    rating: {
      type: Number,
      default: 0,
    },

    enrollmentCount: {
      type: Number,
      default: 0,
    },

    totalDuration: {
      type: Number,
      default: 0,
    }, // seconds

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sections: {
      type: [sectionSchema],
      default: [],
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

/* ================= INDEX SEARCH ================= */

courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ price: 1 });
courseSchema.index({ rating: -1 });

module.exports = mongoose.model("Course", courseSchema);
