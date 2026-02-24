const express = require("express");
const router = express.Router();

/* Controllers */
const {
  searchCourses,
  getCourseLessons
} = require("../controller/courseController");

/* Middlewares */
const { protect } = require("../middleware/authMiddleware");
const checkEnrollment = require("../middleware/checkEnrollment");

console.log("courseRoutes.js - protect:", typeof protect);
console.log("courseRoutes.js - checkEnrollment:", typeof checkEnrollment);

/* =========================
   PUBLIC ROUTES
========================= */

// Search + filter + pagination
router.get("/search", searchCourses);


/* =========================
   PRIVATE ROUTES
========================= */

// Get lessons of course (User must login + purchased)
router.get(
  "/:courseId/lessons",
  protect,
  checkEnrollment,
  getCourseLessons
);

module.exports = router;
