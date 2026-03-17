const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // This can be a String or ObjectId depending on how lessons are stored (embedded vs separate)
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Populate user info by default
commentSchema.pre(/^find/, function (next) {
  this.populate("userId", "fullname avatarURL role");
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
