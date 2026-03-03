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

console.log("enrollmentRoutes.js - protect:", typeof protect);
console.log("enrollmentRoutes.js - checkEnrollment:", typeof checkEnrollment);
console.log("enrollmentRoutes.js - completeLesson:", typeof completeLesson);
console.log("enrollmentRoutes.js - getMyCourses:", typeof getMyCourses);

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