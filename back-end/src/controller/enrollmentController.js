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
      paymentStatus: "paid",
    })
      .populate({
        path: "courseId",
        select:
          "title thumbnail instructorId category totalDuration sections rating enrollmentCount",
        populate: [
          { path: "instructorId", select: "fullname" },
          { path: "category", select: "name slug description" },
        ],
      })
      .sort({ updatedAt: -1 })
      .lean();

    /* Flatten section items to lesson-only list (by orderIndex) */
    function getLessonItems(course) {
      const items = [];
      (course?.sections || []).forEach((sec) => {
        (sec.items || [])
          .filter((i) => i.itemType === "lesson")
          .forEach((i) => items.push({ ...i, orderIndex: i.orderIndex }));
      });
      items.sort((a, b) => a.orderIndex - b.orderIndex);
      return items;
    }

    const data = enrollments
      .filter((e) => e.courseId)
      .map((e) => {
        const course = e.courseId;
        const lessonItems = getLessonItems(course);
        const completedIds = new Set(
          (e.lessonsProgress || [])
            .filter((l) => l.completed && l.lessonId)
            .map((l) => l.lessonId.toString()),
        );

        let continueLesson = null;
        if (lessonItems.length) {
          continueLesson =
            lessonItems.find(
              (item) =>
                !completedIds.has(
                  (item.itemId || item.itemId?._id)?.toString(),
                ),
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
                order: continueLesson.orderIndex,
              }
            : null,
          course: {
            _id: course._id,
            title: course.title,
            thumbnail: course.thumbnail,
            rating: course.rating,
            enrollmentCount: course.enrollmentCount,
            totalDuration: course.totalDuration,
            instructor: course.instructorId,
          },
        };
      });

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ===============================
   ENROLL FREE COURSE
   POST /api/enrollments/enroll-free
   Body: { courseId }
   
   Chức năng:
   - Đăng ký khóa học MIỄN PHÍ (price = 0) trực tiếp
   - Tạo Enrollment với paymentStatus = "paid" ngay lập tức
   - Không qua payment gateway
   - Tăng enrollmentCount của course
================================*/
exports.enrollFreeCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;

    // Validation: courseId bắt buộc
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    // 1. Kiểm tra course tồn tại
    const course = await Course.findById(courseId).select(
      "price enrollmentCount status",
    );
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 2. Kiểm tra course phải là published
    if (course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Course is not available for enrollment",
      });
    }

    // 3. Kiểm tra course là FREE (price === 0)
    if (course.price !== 0) {
      return res.status(400).json({
        success: false,
        message:
          "This course is not free. Please use payment flow to purchase.",
      });
    }

    // 4. Kiểm tra đã enroll chưa
    const existingEnrollment = await Enrollment.findOne({
      userId,
      courseId,
      paymentStatus: "paid",
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        message: "You are already enrolled in this course",
        data: existingEnrollment,
      });
    }

    // 5. Tạo enrollment mới với paymentStatus = "paid"
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      paymentStatus: "paid", // ← QUAN TRỌNG: Đặt là "paid" ngay
      progress: 0,
      completed: false,
      lessonsProgress: [],
    });

    // 6. Tăng enrollmentCount của course
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 },
    });

    // 7. Trả về response thành công
    res.status(201).json({
      success: true,
      message: "Successfully enrolled in free course",
      data: {
        enrollmentId: enrollment._id,
        courseId: enrollment.courseId,
        paymentStatus: enrollment.paymentStatus,
        progress: enrollment.progress,
        createdAt: enrollment.createdAt,
      },
    });
  } catch (err) {
    console.error("enrollFreeCourse error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
