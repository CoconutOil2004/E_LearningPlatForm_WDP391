const express = require("express");
const router = express.Router();

/* Middlewares */
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { enrollFreeValidation } = require("../validations/enrollment.validation");
const { lessonActionValidation, heartbeatValidation, quizActionValidation } = require("../validations/progress.validation");
const checkEnrollment = require("../middleware/checkEnrollment");

/* Controllers */
const {
  getMyCourses,
  enrollFreeCourse,
  getEnrollmentByCourseId,
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
router.post("/enroll-free", protect, enrollFreeValidation, validate, enrollFreeCourse);

/* Get single enrollment */
router.get("/:courseId", protect, getEnrollmentByCourseId);

/* Mark lesson completed */
router.post(
  "/:courseId/complete-lesson",
  protect,
  checkEnrollment,
  lessonActionValidation,
  validate,
  completeLesson,
);

/* Heartbeat: cộng dồn thời gian xem lesson (body: lessonId, watchedSecondsDelta) */
router.post("/:courseId/heartbeat", protect, checkEnrollment, heartbeatValidation, validate, heartbeat);

/* Đánh dấu đã làm quiz (body: quizId) */
router.post("/:courseId/quiz-done", protect, checkEnrollment, quizActionValidation, validate, markQuizDone);

/* Kiểm tra quyền xem lesson (lock → 403) */
router.get(
  "/:courseId/lesson/:lessonId/access",
  protect,
  checkEnrollment,
  checkLessonAccess,
);

module.exports = router;
