const express = require("express");
const router = express.Router();
const {
  createComment,
  getLessonComments,
  deleteComment
} = require("../controller/commentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createComment);
router.get("/lesson/:lessonId", protect, getLessonComments);
router.delete("/:id", protect, deleteComment);

module.exports = router;
