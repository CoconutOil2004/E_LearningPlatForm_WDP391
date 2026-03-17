const { body } = require('express-validator');
const mongoose = require('mongoose');

const enrollFreeValidation = [
  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) throw new Error('Invalid Course ID');
      return true;
    })
];

const createPaymentValidation = [
  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) throw new Error('Invalid Course ID');
      return true;
    }),
  body('paymentMethod')
    .equals('vnpay').withMessage('Only VNPay is supported')
];

module.exports = { enrollFreeValidation, createPaymentValidation };
