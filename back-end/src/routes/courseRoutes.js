const express = require("express");
const router = express.Router();

const {
  searchCourses,
  getCoursesByCategory,
  getCourseById,
  getCoursePreview,
  createCourse,
  updateCourse,
  uploadVideo,
  submitCourse,
  getInstructorCourses,
  getPendingCourses,
  approveCourse,
  rejectCourse
} = require("../controller/courseController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const uploadVideoMw = require("../middleware/uploadVideo");
const handleUploadError = uploadVideoMw.handleUploadError;

/* ========================= PUBLIC ========================= */
router.get("/search", searchCourses);
router.get("/by-category/:categoryId", getCoursesByCategory);
router.get("/levels", (req, res) => {
  const { LEVEL_ENUM } = require("../controller/courseController");
  res.json({ success: true, data: LEVEL_ENUM });
});

/* ========================= INSTRUCTOR (protect) ========================= */
router.get(
  "/instructor/mine",
  protect,
  authorize("instructor"),
  getInstructorCourses
);
router.post("/", protect, authorize("instructor"), createCourse);
router.put("/:courseId", protect, authorize("instructor"), updateCourse);
router.put("/:courseId/submit", protect, authorize("instructor"), submitCourse);

router.post("/upload-video", protect, uploadVideoMw, handleUploadError, uploadVideo);

/* ========================= ADMIN (trước /:id để không match nhầm) ========================= */
router.get("/admin/pending", protect, authorize("admin"), getPendingCourses);
router.put("/:courseId/approve", protect, authorize("admin"), approveCourse);
router.put("/:courseId/reject", protect, authorize("admin"), rejectCourse);

router.get("/:id/preview", getCoursePreview);
router.get("/:id", protect, getCourseById);

module.exports = router;
