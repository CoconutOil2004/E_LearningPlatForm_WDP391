const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const { buildItemsProgress } = require("../utils/buildItemsProgress");
const { sendNotification } = require("../utils/notificationUtils");

exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user._id;

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
          .forEach((i) => items.push(i));
      });
      items.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      return items;
    }

    const filtered = enrollments.filter((e) => e.courseId);
    const data = await Promise.all(
      filtered.map(async (e) => {
        const course = e.courseId;
        const lessonItems = getLessonItems(course);

        let itemsProgress = e.itemsProgress || [];
        if (itemsProgress.length === 0 && e.courseId) {
          const built = await buildItemsProgress(e.courseId);
          if (built.length > 0) {
            await Enrollment.updateOne(
              { _id: e._id },
              { $set: { itemsProgress: built } },
            );
            itemsProgress = built;
          }
        }

        const completedIds = new Set(
          itemsProgress
            .filter((i) => i.itemType === "lesson" && i.status === "done")
            .map((i) => i.itemId?.toString()),
        );

        let continueLesson = null;
        if (lessonItems.length) {
          const next = lessonItems.find(
            (item) => !completedIds.has(item.itemId?.toString()),
          );
          const target = next || lessonItems[0];
          continueLesson = {
            lessonId: target.itemId?.toString(),
            title: target.title,
            order: target.orderIndex,
          };
        }

        return {
          enrollmentId: e._id,
          progress: e.progress,
          completed: e.completed,
          lastUpdated: e.updatedAt,
          continueLesson,
          itemsProgress: itemsProgress.length > 0 ? itemsProgress : undefined,
          course: {
            _id: course._id,
            title: course.title,
            thumbnail: course.thumbnail,
            rating: course.rating,
            enrollmentCount: course.enrollmentCount,
            totalDuration: course.totalDuration,
            sections: course.sections,
            instructor: course.instructorId,
            category: course.category,
          },
        };
      }),
    );

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   ENROLL FREE COURSE
   POST /api/enrollments/enroll-free
   Body: { courseId }
================================*/
exports.enrollFreeCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    // 1. Check course exists
    const course = await Course.findById(courseId).select(
      "title price enrollmentCount status",
    );
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 2. Course must be published
    if (course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Course is not available for enrollment",
      });
    }

    // 3. Course must be FREE
    if (course.price !== 0) {
      return res.status(400).json({
        success: false,
        message:
          "This course is not free. Please use payment flow to purchase.",
      });
    }

    // 4. Check for ANY existing enrollment (paid OR pending) to avoid unique index conflict
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });

    if (existingEnrollment) {
      if (existingEnrollment.paymentStatus === "paid") {
        return res.status(200).json({
          success: true,
          message: "You are already enrolled in this course",
          data: existingEnrollment,
        });
      }
      // Pending enrollment exists (e.g. from a prior failed paid attempt) → upgrade to paid
      existingEnrollment.paymentStatus = "paid";
      await existingEnrollment.save();
      return res.status(200).json({
        success: true,
        message: "Successfully enrolled in free course",
        data: {
          enrollmentId: existingEnrollment._id,
          courseId: existingEnrollment.courseId,
          paymentStatus: existingEnrollment.paymentStatus,
          progress: existingEnrollment.progress,
          createdAt: existingEnrollment.createdAt,
        },
      });
    }

    // 5. Build itemsProgress (full syllabus: lesson lock/progress + duration, quiz open)
    const itemsProgress = await buildItemsProgress(courseId);

    // 6. Create new enrollment with paymentStatus = "paid"
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      paymentStatus: "paid",
      progress: 0,
      completed: false,
      itemsProgress,
    });

    // 7. Increment enrollmentCount
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 },
    });

    // 7.1 Fetch student details for instructor notification
    const student = await User.findById(userId).select("fullname username");

    // 8. Gửi thông báo cho học viên
    await sendNotification(req.app, {
      userId,
      title: "Đăng ký khóa học",
      message: `Chúc mừng! Bạn đã đăng ký khóa học "${course.title || "mới"}" thành công.`,
      type: "success",
      link: `/learning/${courseId}`,
    });

    // 9. Gửi thông báo cho Giảng viên
    if (course.instructorId) {
      await sendNotification(req.app, {
        userId: course.instructorId,
        title: "Học viên mới",
        message: `Học viên ${student?.fullname || student?.username || "mới"} đã tham gia khóa học "${course.title}" của bạn.`,
        type: "info",
        link: `/instructor/courses/edit/${courseId}`, // Assuming instructor dashboard link
      });
    }

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
    // Handle MongoDB duplicate key error gracefully
    if (err.code === 11000) {
      const existing = await Enrollment.findOne({
        userId: req.user._id,
        courseId: req.body.courseId,
      });
      if (existing && existing.paymentStatus === "paid") {
        return res.status(200).json({
          success: true,
          message: "You are already enrolled in this course",
          data: existing,
        });
      }
    }
    console.error("enrollFreeCourse error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
