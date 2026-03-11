const express = require("express");
const router = express.Router();

const {
  searchCourses,
  getCourseLessons,
  getCourseById,
  getCoursePreview,
  createCourse,
  updateCourse,
  uploadVideo
} = require("../controller/courseController");

const { protect } = require("../middleware/authMiddleware");
const checkEnrollment = require("../middleware/checkEnrollment");
const uploadVideoMw = require("../middleware/uploadVideo");
const handleUploadError = uploadVideoMw.handleUploadError;

/* ========================= PUBLIC ========================= */
router.get("/search", searchCourses);
router.get("/levels", (req, res) => {
  const { LEVEL_ENUM } = require("../controller/courseController");
  res.json({ success: true, data: LEVEL_ENUM });
});

/* ========================= INSTRUCTOR (protect) ========================= */
router.post("/", protect, createCourse);
router.put("/:courseId", protect, updateCourse);

/* Upload video (trả về videoUrl, duration; FE gửi vào add lesson) – route cố định trước /:id */
router.post("/upload-video", protect, uploadVideoMw, handleUploadError, uploadVideo);

router.get("/:id/preview", getCoursePreview);
router.get("/:id", protect, getCourseById);

/* ========================= HỌC VIÊN ĐÃ MUA ========================= */
router.get("/:courseId/lessons", protect, checkEnrollment, getCourseLessons);

module.exports = router;
