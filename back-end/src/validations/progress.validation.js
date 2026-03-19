const { body } = require('express-validator');
const mongoose = require('mongoose');

const lessonActionValidation = [
  body('lessonId')
    .notEmpty().withMessage('Lesson ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) throw new Error('Invalid Lesson ID');
      return true;
    })
];

const heartbeatValidation = [
  ...lessonActionValidation,
  body('watchedSecondsDelta')
    .notEmpty().withMessage('watchedSecondsDelta is required')
    .isNumeric().withMessage('Must be a number')
];

const quizActionValidation = [
  body('quizId')
    .notEmpty().withMessage('Quiz ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) throw new Error('Invalid Quiz ID');
      return true;
    })
];

module.exports = {
  lessonActionValidation,
  heartbeatValidation,
  quizActionValidation
};
