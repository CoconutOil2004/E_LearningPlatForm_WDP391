const { body } = require('express-validator');

const updateProfileValidation = [
  body('fullname')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Full name must be at most 50 characters'),
  body('avatarURL')
    .optional()
    .trim()
    .isURL().withMessage('Avatar URL must be a valid URL'),
  body('password')
    .optional()
    .trim()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

module.exports = {
  updateProfileValidation
};
