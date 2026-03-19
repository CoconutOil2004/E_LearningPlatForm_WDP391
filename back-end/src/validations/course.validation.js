const { body } = require("express-validator");
const mongoose = require("mongoose");

const createCourseValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 60 })
    .withMessage("Title must be at most 60 characters"),
  body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Category ID");
      }
      return true;
    }),
  body("level")
    .notEmpty()
    .withMessage("Level is required")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Invalid level"),
  body("description")
    .trim()
    .optional()
    .isLength({ min: 10 })
    .withMessage("Description should be at least 10 characters long"),
  body("thumbnail")
    .trim()
    .optional()
    .isURL()
    .withMessage("Thumbnail must be a valid URL"),
];

const updateCourseValidation = [
  body("title")
    .trim()
    .optional()
    .isLength({ max: 60 })
    .withMessage("Title must be at most 60 characters"),
  body("categoryId")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Category ID");
      }
      return true;
    }),
  body("level")
    .optional()
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Invalid level"),
  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((v) => v >= 0)
    .withMessage("Price must be >= 0"),
  body("status")
    .optional()
    .isIn(["draft", "pending", "published", "rejected"])
    .withMessage("Invalid status"),
  body("sections")
    .optional()
    .isArray()
    .withMessage("Sections must be an array"),
];

module.exports = {
  createCourseValidation,
  updateCourseValidation,
};
