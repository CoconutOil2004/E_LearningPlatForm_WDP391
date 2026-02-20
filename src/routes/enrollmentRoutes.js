const express = require("express");
const router = express.Router();

/* Middlewares */
const protect = require("../middlewares/authMiddleware");
const checkEnrollment = require("../middlewares/checkEnrollment");

/* Controllers */
const {
  completeLesson,
  getMyCourses
} = require("../controllers/enrollmentController");

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