const express = require("express");
const router = express.Router();

/* Middlewares */
const { protect } = require("../middleware/authMiddleware");
const checkEnrollment = require("../middleware/checkEnrollment");

/* Controllers */
const {
  getMyCourses,
  enrollFreeCourse,
} = require("../controller/enrollmentController");
const {
  completeLesson,
  heartbeat,
  markQuizDone,
  checkLessonAccess,
} = require("../controller/lessonController");

console.log("enrollmentRoutes.js - protect:", typeof protect);
console.log("enrollmentRoutes.js - checkEnrollment:", typeof checkEnrollment);
console.log("enrollmentRoutes.js - completeLesson:", typeof completeLesson);
console.log("enrollmentRoutes.js - getMyCourses:", typeof getMyCourses);
console.log("enrollmentRoutes.js - enrollFreeCourse:", typeof enrollFreeCourse);

/* ======================================
   STUDENT LEARNING ROUTES
====================================== */

/* List purchased courses + progress */
router.get("/my-courses", protect, getMyCourses);

/* Enroll free course */
router.post("/enroll-free", protect, enrollFreeCourse);

/* Mark lesson completed */
router.post(
  "/:courseId/complete-lesson",
  protect,
  checkEnrollment,
  completeLesson,
);

/* Heartbeat: cộng dồn thời gian xem lesson (body: lessonId, watchedSecondsDelta) */
router.post("/:courseId/heartbeat", protect, checkEnrollment, heartbeat);

/* Đánh dấu đã làm quiz (body: quizId) */
router.post("/:courseId/quiz-done", protect, checkEnrollment, markQuizDone);

/* Kiểm tra quyền xem lesson (lock → 403) */
router.get(
  "/:courseId/lesson/:lessonId/access",
  protect,
  checkEnrollment,
  checkLessonAccess,
);

module.exports = router;
