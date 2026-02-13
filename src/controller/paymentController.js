const Order = require("../models/Order");
const Course = require("../models/Course");

exports.createOrder = async (req, res) => {
  try {
    const { courseId, paymentMethod } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const order = await Order.create({
      userId,
      courseId,
      price: course.price,
      paymentMethod
    });

    res.json({
      success: true,
      order
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
