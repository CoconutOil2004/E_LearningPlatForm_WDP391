const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

function countLessonItems(sections) {
  let n = 0;
  (sections || []).forEach(sec => {
    n += (sec.items || []).filter(i => i.itemType === "lesson").length;
  });
  return n;
}

exports.completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const enrollment = req.enrollment;

    const lid = mongoose.Types.ObjectId.isValid(lessonId)
      ? new mongoose.Types.ObjectId(lessonId)
      : null;
    if (!lid) {
      return res.status(400).json({ success: false, message: "Invalid lesson id" });
    }

    const course = await Course.findById(enrollment.courseId).select("sections");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const totalLessons = countLessonItems(course.sections);
    if (totalLessons === 0) {
      return res.json({
        progress: enrollment.progress,
        completed: enrollment.completed
      });
    }

    if (!enrollment.lessonsProgress) enrollment.lessonsProgress = [];
    const entry = enrollment.lessonsProgress.find(
      l => l?.lessonId?.toString() === lid.toString()
    );
    if (entry) {
      entry.completed = true;
    } else {
      enrollment.lessonsProgress.push({
        lessonId: lid,
        completed: true,
        watchedSeconds: 0,
        lastWatchedAt: new Date()
      });
    }

    const completedCount = enrollment.lessonsProgress.filter(l => l.completed).length;
    enrollment.progress = Math.round((completedCount / totalLessons) * 100);
    if (enrollment.progress >= 100) enrollment.completed = true;

    await enrollment.save();

    res.json({
      progress: enrollment.progress,
      completed: enrollment.completed
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};