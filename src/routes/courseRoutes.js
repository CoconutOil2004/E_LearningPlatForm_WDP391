const express = require("express");
const router = express.Router();

/* Controllers */
const {
  searchCourses,
  getCourseLessons
} = require("../controllers/courseController");

/* Middlewares */
const protect = require("../middlewares/authMiddleware");
const checkEnrollment = require("../middlewares/checkEnrollment");

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
