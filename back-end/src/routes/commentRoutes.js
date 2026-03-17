const express = require("express");
const router = express.Router();
const {
  createComment,
  getLessonComments,
  deleteComment
} = require("../controller/commentController");
const { protect, authorize } = require("../middleware/auth.middleware");

router.post("/", protect, createComment);
router.get("/lesson/:lessonId", protect, getLessonComments);
router.delete("/:id", protect, deleteComment);

// Admin global comments
const { getAllComments } = require("../controller/commentController");
router.get("/admin/all", protect, getAllComments);

module.exports = router;
