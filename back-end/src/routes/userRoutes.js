const express = require('express');
const router = express.Router();
const {
  getStudents,
  getInstructors,
  createInstructor,
  searchUsers,
  getUserById,
} = require('../controller/userController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/auth.middleware');

// Quản lý student & instructor (admin only)
router.get('/students', protect, isAdmin, getStudents);
router.get('/instructors', protect, isAdmin, getInstructors);
router.post('/instructors', protect, isAdmin, createInstructor);

// Tìm kiếm & xem chi tiết user
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserById);

module.exports = router;
