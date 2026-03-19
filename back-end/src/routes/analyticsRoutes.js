const express = require("express");
const router = express.Router();
const {
  getAdminAnalytics,
  getInstructorAnalytics
} = require("../controller/analyticsController");
const { protect, authorize } = require("../middleware/auth.middleware");

// Admin analytics
router.get("/admin", protect, authorize("admin"), getAdminAnalytics);

// Instructor analytics
router.get("/instructor", protect, authorize("instructor"), getInstructorAnalytics);

module.exports = router;
