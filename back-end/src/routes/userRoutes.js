const express = require('express');
const router = express.Router();
const {
  getStudents,
  getInstructors,
  createInstructor,
  updateInstructorAction,
  updateStudentAction,
  searchUsers,
  getUserById,
  toggleWishlist,
  getInstructorStudents,
  getInstructorRevenue,
} = require('../controller/userController');
const { protect, isAdmin, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { updateProfileValidation } = require('../validations/user.validation');

// Quản lý student & instructor (admin only)
router.get('/students', protect, isAdmin, getStudents);
router.get('/instructors', protect, isAdmin, getInstructors);
router.post('/instructors', protect, isAdmin, createInstructor);
router.patch('/instructors/:id/action', protect, isAdmin, updateInstructorAction);
router.patch('/students/:id/action', protect, isAdmin, updateStudentAction);

// Instructor-specific stats
router.get('/instructor/students', protect, authorize('instructor'), getInstructorStudents);
router.get('/instructor/revenue', protect, authorize('instructor'), getInstructorRevenue);

// Tìm kiếm & xem chi tiết user
router.get('/search', protect, searchUsers);
router.post('/wishlist/toggle', protect, toggleWishlist);
router.get('/:id', protect, getUserById);

module.exports = router;