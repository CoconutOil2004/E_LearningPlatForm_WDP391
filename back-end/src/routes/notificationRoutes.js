const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markOneAsRead,
  markAllAsRead,
} = require("../controller/notificationController");
const { protect } = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(protect);

router.get("/", getNotifications);
router.patch("/:id/read", markOneAsRead);
router.post("/mark-all-read", markAllAsRead);

module.exports = router;
