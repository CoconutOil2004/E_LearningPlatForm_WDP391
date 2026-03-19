const { body } = require('express-validator');
const mongoose = require('mongoose');

const createReviewValidation = [
  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Course ID');
      }
      return true;
    }),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment must be at most 500 characters')
];

const replyReviewValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Reply content is required')
    .isLength({ max: 500 }).withMessage('Reply must be at most 500 characters')
];

module.exports = {
  createReviewValidation,
  replyReviewValidation
};
