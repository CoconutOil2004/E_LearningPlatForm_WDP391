const express = require("express");
const router = express.Router();

const {
  searchCourses,
  getCoursesByCategory,
  getCourseById,
  getCoursePreview,
  createCourse,
  updateCourse,
  submitCourse,
  getInstructorCourses,
  getPendingCourses,
  getAdminAllCourses,
  approveCourse,
  rejectCourse,
} = require("../controller/courseController");

const { protect, authorize, isAdmin } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createCourseValidation, updateCourseValidation } = require("../validations/course.validation");

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
  getInstructorCourses,
);
router.post("/", protect, authorize("instructor"), createCourseValidation, validate, createCourse);
router.put("/:courseId", protect, authorize("instructor"), updateCourseValidation, validate, updateCourse);
router.put("/:courseId/submit", protect, authorize("instructor"), submitCourse);

/* ========================= ADMIN (before /:id to avoid wrong match) ========================= */
router.get("/admin/pending", protect, authorize("admin"), getPendingCourses);
router.get("/admin/all", protect, authorize("admin"), getAdminAllCourses);
router.put("/:courseId/approve", protect, authorize("admin"), approveCourse);
router.put("/:courseId/reject", protect, authorize("admin"), rejectCourse);

router.get("/:id/preview", getCoursePreview);
router.get("/:id", protect, getCourseById);

module.exports = router;
