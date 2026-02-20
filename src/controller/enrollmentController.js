const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

exports.getMyCourses = async (req, res) => {
  try {

    const userId = req.user._id;

    /* =========================
       GET PAID ENROLLMENTS
    ========================= */
    const enrollments = await Enrollment.find({
      userId,
      paymentStatus: "paid"
    })
      .populate({
        path: "courseId",
        select:
          "title thumbnail instructorId totalDuration lessons rating enrollmentCount",
        populate: {
          path: "instructorId",
          select: "name"
        }
      })
      .sort({ updatedAt: -1 })
      .lean(); // ⭐ faster response

    /* =========================
       FORMAT DATA (Udemy style)
    ========================= */
    const data = enrollments
      .filter(e => e.courseId) // tránh course bị xoá
      .map(e => {

        const course = e.courseId;

        /* ===== CONTINUE WATCHING ===== */
        let continueLesson = null;

        if (course.lessons?.length) {
          const completedIds = e.lessonsProgress
            .filter(l => l.completed)
            .map(l => l.lessonId);

          continueLesson =
            course.lessons.find(
              l => !completedIds.includes(l.lessonId)
            ) || course.lessons[0];
        }

        return {
          enrollmentId: e._id,

          progress: e.progress,
          completed: e.completed,

          lastUpdated: e.updatedAt,

          continueLesson: continueLesson
            ? {
                lessonId: continueLesson.lessonId,
                title: continueLesson.title,
                order: continueLesson.order
              }
            : null,

          course: {
            _id: course._id,
            title: course.title,
            thumbnail: course.thumbnail,
            rating: course.rating,
            enrollmentCount: course.enrollmentCount,
            totalDuration: course.totalDuration,
            instructor: course.instructorId
          }
        };
      });

    res.json({
      success: true,
      total: data.length,
      data
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};