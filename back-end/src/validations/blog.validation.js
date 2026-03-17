const { body } = require('express-validator');
const mongoose = require('mongoose');

const createBlogValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title is too long'),
  body('summary')
    .trim()
    .notEmpty().withMessage('Summary is required')
    .isLength({ max: 500 }).withMessage('Summary is too long'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Category ID');
      }
      return true;
    }),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
  body('thumbnail')
    .optional()
    .trim()
    .isURL().withMessage('Thumbnail must be a valid URL'),
  body('status')
    .optional()
    .isIn(['draft', 'pending']).withMessage('Invalid status')
];

const updateBlogValidation = [
  body('title').optional().trim().notEmpty(),
  body('summary').optional().trim().notEmpty(),
  body('category')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Category ID');
      }
      return true;
    }),
  body('content').optional().trim().notEmpty(),
  body('status')
    .optional()
    .isIn(['draft', 'pending']).withMessage('Invalid status')
];

module.exports = {
  createBlogValidation,
  updateBlogValidation
};
