const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

exports.completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const enrollment = req.enrollment;

    const course = await Course.findById(enrollment.courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const totalLessons = course.lessons.length;

    // lưu lesson đã học (nên thêm field này)
    if (!enrollment.completedLessons)
      enrollment.completedLessons = [];

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const progress =
      (enrollment.completedLessons.length / totalLessons) * 100;

    enrollment.progress = Math.round(progress);

    if (enrollment.progress === 100) {
      enrollment.completed = true;
    }

    await enrollment.save();

    res.json({
      progress: enrollment.progress,
      completed: enrollment.completed
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};