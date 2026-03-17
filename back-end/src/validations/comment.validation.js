const { body } = require('express-validator');
const mongoose = require('mongoose');

const commentValidation = [
  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) throw new Error('Invalid Course ID');
      return true;
    }),
  body('lessonId')
    .notEmpty().withMessage('Lesson ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) throw new Error('Invalid Lesson ID');
      return true;
    }),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ max: 1000 }).withMessage('Comment is too long'),
  body('parentCommentId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) throw new Error('Invalid Parent Comment ID');
      return true;
    })
];

module.exports = { commentValidation };
