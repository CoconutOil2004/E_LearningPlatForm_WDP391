const Enrollment = require("../models/Enrollment");

const checkEnrollment = async (req, res, next) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = req.user._id;
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "CourseId is required"
      });
    }

    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      paymentStatus: "paid"
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must purchase this course"
      });
    }

    /* attach for next controller */
    req.enrollment = enrollment;

    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = checkEnrollment;