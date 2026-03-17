const { validationResult } = require('express-validator');

/**
 * Common validation result handler
 * Returns 400 with formatted errors if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param || err.path]: err.msg }));

  return res.status(400).json({
    success: false,
    message: 'Validation Error',
    errors: extractedErrors,
  });
};

module.exports = {
  validate,
};
