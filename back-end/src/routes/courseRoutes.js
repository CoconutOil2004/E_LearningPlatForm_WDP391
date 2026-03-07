const express = require("express");
const router = express.Router();

/* Controllers */
const {
   searchCourses,
   getCoursesByCategory,
   getCourseLessons,
   createCourse,
   updateCourse,
   submitCourse,
   getPendingCourses,
   approveCourse,
   rejectCourse
} = require("../controller/courseController");
const {
   addSection,
   updateSection,
   deleteSection,
   addLesson,
   addQuiz,
   getCurriculum
} = require("../controller/curriculumController");

/* Middlewares */
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const checkEnrollment = require("../middleware/checkEnrollment");
const uploadVideoMw = require("../middleware/uploadVideo");
const uploadVideo = uploadVideoMw;
const handleUploadError = uploadVideoMw.handleUploadError;

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/search", searchCourses);
router.get("/by-category/:categoryId", getCoursesByCategory);
router.get("/levels", (req, res) => {
   const { LEVEL_ENUM } = require("../controller/courseController");
   res.json({ success: true, data: LEVEL_ENUM });
});

/* =========================
   INSTRUCTOR (protected)
========================= */
router.post("/", protect, authorize("instructor"), createCourse);
router.put("/:courseId", protect, authorize("instructor"), updateCourse);
router.put("/:courseId/submit", protect, authorize("instructor"), submitCourse);

/* Curriculum: Section / Lesson / Quiz (chỉ instructor) */
router.get("/:id/curriculum", protect, authorize("instructor"), getCurriculum);
router.post("/:id/sections", protect, authorize("instructor"), addSection);
router.put("/:id/sections/:sectionIndex", protect, authorize("instructor"), updateSection);
router.delete("/:id/sections/:sectionIndex", protect, authorize("instructor"), deleteSection);
router.post("/:id/sections/:sectionIndex/lessons", protect, authorize("instructor"), uploadVideo, handleUploadError, addLesson);
router.post("/:id/sections/:sectionIndex/quizzes", protect, authorize("instructor"), addQuiz);

/* =========================
   ADMIN (protected)
========================= */
router.get("/admin/pending", protect, authorize("admin"), getPendingCourses);
router.put("/:courseId/approve", protect, authorize("admin"), approveCourse);
router.put("/:courseId/reject", protect, authorize("admin"), rejectCourse);

/* =========================
   PRIVATE ROUTES (học viên đã mua)
========================= */
router.get(
   "/:courseId/lessons",
   protect,
   checkEnrollment,
   getCourseLessons
);

module.exports = router;
