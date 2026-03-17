const Category = require("../models/Category");
const mongoose = require("mongoose");

/**
 * GET all categories (for dropdowns / filters).
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .lean();
    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Validate that categoryId exists in Category collection.
 * Use in course create/update flow.
 * @returns {Promise<{ valid: boolean, category?: object, error?: string }>}
 */
exports.validateCategoryId = async (categoryId) => {
  if (!categoryId) {
    return { valid: true, category: null };
  }
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return { valid: false, error: "Invalid category ID" };
  }
  const category = await Category.findById(categoryId).lean();
  if (!category) {
    return { valid: false, error: "Category not found" };
  }
  return { valid: true, category };
};
