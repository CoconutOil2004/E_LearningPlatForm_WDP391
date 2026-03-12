const express = require("express");
const router = express.Router();

/* Middlewares */
const { protect } = require("../middleware/authMiddleware");
const checkEnrollment = require("../middleware/checkEnrollment");

/* Controllers */
const {
  getMyCourses
} = require("../controller/enrollmentController");
const { completeLesson } = require("../controller/lessonController");

/* ======================================
   STUDENT LEARNING ROUTES
====================================== */

/* List purchased courses + progress */
router.get("/my-courses", protect, getMyCourses);

/* Mark lesson completed */
router.post(
  "/:courseId/complete-lesson",
  protect,
  checkEnrollment,
  completeLesson
);

module.exports = router;