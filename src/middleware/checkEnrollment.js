const Enrollment = require("../models/Enrollment");

const checkEnrollment = async (req, res, next) => {
  try {
    const userId = req.user.id; // lấy từ JWT middleware
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        message: "CourseId is required"
      });
    }

    const enrollment = await Enrollment.findOne({
      userId,
      courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must purchase this course to access"
      });
    }

    next();

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = checkEnrollment;
