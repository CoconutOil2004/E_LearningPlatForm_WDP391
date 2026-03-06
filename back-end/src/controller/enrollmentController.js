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
          "title thumbnail instructorId category totalDuration sections rating enrollmentCount",
        populate: [
          { path: "instructorId", select: "fullname" },
          { path: "category", select: "name slug description" }
        ]
      })
      .sort({ updatedAt: -1 })
      .lean();

    /* Flatten section items to lesson-only list (by orderIndex) */
    function getLessonItems(course) {
      const items = [];
      (course?.sections || []).forEach(sec => {
        (sec.items || [])
          .filter(i => i.itemType === "lesson")
          .forEach(i => items.push({ ...i, orderIndex: i.orderIndex }));
      });
      items.sort((a, b) => a.orderIndex - b.orderIndex);
      return items;
    }

    const data = enrollments
      .filter(e => e.courseId)
      .map(e => {
        const course = e.courseId;
        const lessonItems = getLessonItems(course);
        const completedIds = new Set(
          (e.lessonsProgress || [])
            .filter(l => l.completed && l.lessonId)
            .map(l => l.lessonId.toString())
        );

        let continueLesson = null;
        if (lessonItems.length) {
          continueLesson =
            lessonItems.find(
              item => !completedIds.has((item.itemId || item.itemId?._id)?.toString())
            ) || lessonItems[0];
        }

        return {
          enrollmentId: e._id,
          progress: e.progress,
          completed: e.completed,
          lastUpdated: e.updatedAt,
          continueLesson: continueLesson
            ? {
                lessonId: continueLesson.itemId?._id || continueLesson.itemId,
                title: continueLesson.title,
                order: continueLesson.orderIndex
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