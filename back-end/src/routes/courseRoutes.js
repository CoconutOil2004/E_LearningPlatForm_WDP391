const express = require("express");
const router = express.Router();

/* Controllers */
const {
   searchCourses,
   getCourseLessons,
   createCourse,
   updateCourse
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
const checkEnrollment = require("../middleware/checkEnrollment");
const uploadVideoMw = require("../middleware/uploadVideo");
const uploadVideo = uploadVideoMw;
const handleUploadError = uploadVideoMw.handleUploadError;

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/search", searchCourses);
router.get("/levels", (req, res) => {
   const { LEVEL_ENUM } = require("../controller/courseController");
   res.json({ success: true, data: LEVEL_ENUM });
});

/* =========================
   INSTRUCTOR (protected)
========================= */
router.post("/", protect, createCourse);
router.put("/:courseId", protect, updateCourse);

/* Curriculum: Section / Lesson / Quiz (chỉ instructor) */
router.get("/:id/curriculum", protect, getCurriculum);
router.post("/:id/sections", protect, addSection);
router.put("/:id/sections/:sectionIndex", protect, updateSection);
router.delete("/:id/sections/:sectionIndex", protect, deleteSection);
router.post("/:id/sections/:sectionIndex/lessons", protect, uploadVideo, handleUploadError, addLesson);
router.post("/:id/sections/:sectionIndex/quizzes", protect, addQuiz);

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
