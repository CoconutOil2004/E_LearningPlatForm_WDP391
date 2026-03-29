const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { LESSON_COMPLETE_THRESHOLD } = require("../models/Enrollment");
const { buildItemsProgress } = require("../utils/buildItemsProgress");
const { sendNotification, notifyAdmins } = require("../utils/notificationUtils");
const User = require("../models/User");

function countLessonItems(sections) {
  let n = 0;
  (sections || []).forEach((sec) => {
    n += (sec.items || []).filter((i) => i.itemType === "lesson").length;
  });
  return n;
}

/** Update enrollment.progress and completed from itemsProgress (only counts done lessons). */
function recalcProgressFromItemsProgress(enrollment, totalLessons) {
  if (totalLessons === 0) return;
  const doneCount = (enrollment.itemsProgress || []).filter(
    (i) => i.itemType === "lesson" && i.status === "done",
  ).length;
  enrollment.progress = Math.round((doneCount / totalLessons) * 100);
  
  // Khi hoàn thành 100% → chuyển sang pending để chờ admin duyệt
  if (enrollment.progress >= 100) {
    enrollment.completed = true;
    // Chỉ chuyển sang pending nếu chưa được duyệt
    if (enrollment.certificateStatus === "not_eligible") {
      enrollment.certificateStatus = "pending";
    }
  }
}

exports.completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const enrollment = req.enrollment;

    const lid = new mongoose.Types.ObjectId(lessonId);

    const course = await Course.findById(enrollment.courseId).select(
      "sections",
    );
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const totalLessons = countLessonItems(course.sections);
    if (totalLessons === 0) {
      return res.json({
        success: true,
        progress: enrollment.progress,
        completed: enrollment.completed,
        itemsProgress: enrollment.itemsProgress || [],
      });
    }

    let items = enrollment.itemsProgress || [];
    if (items.length === 0) {
      enrollment.itemsProgress = await buildItemsProgress(enrollment.courseId);
      await enrollment.save();
      items = enrollment.itemsProgress;
    }

    const lidStr = lid.toString();
    const lessonEntry = items.find(
      (i) => i.itemType === "lesson" && i.itemId?.toString() === lidStr,
    );

    if (!lessonEntry) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found in progress" });
    }

    // Anti-cheat: kiểm tra watchedSeconds >= 30% duration trước khi cho phép complete.
    // Bỏ qua check khi duration = 0 (video chưa có duration → cho phép complete thủ công).
    const duration = lessonEntry.duration || 0;
    if (duration > 0) {
      const threshold = duration * LESSON_COMPLETE_THRESHOLD;
      if ((lessonEntry.watchedSeconds || 0) < threshold) {
        return res.status(403).json({
          success: false,
          message: `Watch at least 30% of the lesson before completing (${Math.ceil(threshold)}s required, ${Math.floor(lessonEntry.watchedSeconds || 0)}s watched).`,
        });
      }
    }

    if (lessonEntry.status !== "done") {
      lessonEntry.status = "done";
      const lessonIndexes = items
        .map((i, idx) => (i.itemType === "lesson" ? idx : -1))
        .filter((idx) => idx >= 0);
      const currentIdx = items.indexOf(lessonEntry);
      const nextLessonIdx = lessonIndexes.find((idx) => idx > currentIdx);
      // Chỉ unlock bài tiếp theo nếu nó đang bị "lock"
      if (
        nextLessonIdx !== undefined &&
        items[nextLessonIdx] &&
        items[nextLessonIdx].status === "lock"
      ) {
        items[nextLessonIdx].status = "progress";
      }
    }
    recalcProgressFromItemsProgress(enrollment, totalLessons);

    await enrollment.save();

    res.json({
      success: true,
      progress: enrollment.progress,
      completed: enrollment.completed,
      itemsProgress: enrollment.itemsProgress,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   HEARTBEAT – FE gửi mỗi ~10s: cộng dồn watchedSeconds.
   Khi watchedSeconds >= 30% duration → lesson done, unlock lesson tiếp theo.
   Body: { lessonId, watchedSecondsDelta }
===================================================== */
exports.heartbeat = async (req, res) => {
  try {
    const { lessonId, watchedSecondsDelta } = req.body;
    const enrollment = req.enrollment;

    const lid = new mongoose.Types.ObjectId(lessonId);
    const delta = Math.max(0, Number(watchedSecondsDelta) || 0);

    let items = enrollment.itemsProgress || [];
    if (items.length === 0) {
      enrollment.itemsProgress = await buildItemsProgress(enrollment.courseId);
      await enrollment.save();
      items = enrollment.itemsProgress;
    }
    if (items.length === 0) {
      return res.json({
        success: true,
        progress: enrollment.progress,
        completed: enrollment.completed,
        itemsProgress: [],
      });
    }

    const lidStr = lid.toString();
    const lessonEntry = items.find(
      (i) => i.itemType === "lesson" && i.itemId?.toString() === lidStr,
    );
    if (!lessonEntry) {
      return res.json({
        success: true,
        progress: enrollment.progress,
        completed: enrollment.completed,
        itemsProgress: enrollment.itemsProgress,
      });
    }

    // Anti-cheat: từ chối heartbeat nếu lesson đang bị lock.
    // Lesson chỉ được phép nhận watchedSeconds khi status = "progress" hoặc "done".
    if (lessonEntry.status === "lock") {
      return res.status(403).json({
        success: false,
        message: "Lesson is locked. Complete previous lessons first.",
        itemsProgress: enrollment.itemsProgress,
      });
    }

    let lessonJustCompleted = false;

    lessonEntry.watchedSeconds = (lessonEntry.watchedSeconds || 0) + delta;
    const duration = lessonEntry.duration || 0;

    // FIX Bug: nếu duration = 0 thì threshold = 0, mọi heartbeat đầu tiên (watchedSeconds >= 0)
    // đều đánh dấu lesson "done" ngay lập tức → unlock toàn bộ bài sau sai.
    // Khi duration = 0: chỉ lưu watchedSeconds, KHÔNG auto-complete qua heartbeat.
    // Lesson sẽ được complete thủ công khi user bấm "Complete & Continue".
    if (duration > 0) {
      const threshold = duration * LESSON_COMPLETE_THRESHOLD;
      if (
        lessonEntry.status !== "done" &&
        lessonEntry.watchedSeconds >= threshold
      ) {
        lessonEntry.status = "done";
        lessonJustCompleted = true;
        const currentIdx = items.indexOf(lessonEntry);
        const lessonIndexes = items
          .map((i, idx) => (i.itemType === "lesson" ? idx : -1))
          .filter((idx) => idx >= 0);
        const nextLessonIdx = lessonIndexes.find((idx) => idx > currentIdx);
        // FIX: chỉ unlock bài tiếp theo nếu nó đang bị "lock"
        // KHÔNG downgrade "done" → "progress" khi user rewatch bài đã học rồi
        if (
          nextLessonIdx !== undefined &&
          items[nextLessonIdx] &&
          items[nextLessonIdx].status === "lock"
        ) {
          items[nextLessonIdx].status = "progress";
        }
        const totalLessons = items.filter(
          (i) => i.itemType === "lesson",
        ).length;
        
        const wasCompleted = enrollment.completed;
        recalcProgressFromItemsProgress(enrollment, totalLessons);
        
        // Kiểm tra nếu vừa hoàn thành khóa học (chuyển từ chưa hoàn thành → hoàn thành)
        if (!wasCompleted && enrollment.completed && enrollment.certificateStatus === "pending") {
          // Lấy thông tin course và user
          const course = await Course.findById(enrollment.courseId)
            .select("title instructorId")
            .lean();
          const user = await User.findById(enrollment.userId)
            .select("fullname username")
            .lean();
          
          // Gửi notification cho student
          await sendNotification(req.app, {
            userId: enrollment.userId,
            title: "Course completed! 🎉",
            message: `Congratulations! You have completed "${course?.title}". Your certificate is pending admin approval.`,
            type: "success",
            link: `/student/certificates`
          });
          
          // Gửi notification cho tất cả admin
          await notifyAdmins(req.app, {
            title: "Certificate approval needed",
            message: `Student ${user?.fullname || user?.username} completed course "${course?.title}" and is waiting for certificate approval.`,
            type: "info",
            link: `/admin/certificates/pending`
          });
          
          // Gửi notification cho instructor (optional)
          if (course?.instructorId) {
            await sendNotification(req.app, {
              userId: course.instructorId,
              title: "Student completed course",
              message: `${user?.fullname || user?.username} has completed your course "${course?.title}"`,
              type: "info",
              link: `/instructor/students`
            });
          }
        }
      }
    }

    await enrollment.save();

    res.json({
      success: true,
      progress: enrollment.progress,
      completed: enrollment.completed,
      itemsProgress: enrollment.itemsProgress,
      lessonJustCompleted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   CHECK LESSON ACCESS – Trả 200 nếu được xem, 403 nếu lesson đang lock.
   GET /:courseId/lesson/:lessonId/access
===================================================== */
exports.checkLessonAccess = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const enrollment = req.enrollment;

    const lid = mongoose.Types.ObjectId.isValid(lessonId)
      ? new mongoose.Types.ObjectId(lessonId)
      : null;
    if (!lid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid lesson id" });
    }

    const items = enrollment.itemsProgress || [];
    if (items.length === 0) {
      return res.json({ success: true, allowed: true });
    }

    const entry = items.find(
      (i) => i.itemType === "lesson" && i.itemId?.toString() === lid.toString(),
    );
    if (!entry) {
      return res.json({ success: true, allowed: true });
    }
    if (entry.status === "lock") {
      return res.status(403).json({
        success: false,
        allowed: false,
        message: "Complete the previous lesson to unlock.",
      });
    }
    res.json({ success: true, allowed: true, status: entry.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   MARK QUIZ DONE – Khi học sinh bắt đầu/làm xong quiz.
   Body: { quizId }
===================================================== */
exports.markQuizDone = async (req, res) => {
  try {
    const { quizId } = req.body;
    const enrollment = req.enrollment;

    const qid = new mongoose.Types.ObjectId(quizId);

    const items = enrollment.itemsProgress || [];
    const quizEntry = items.find(
      (i) => i.itemType === "quiz" && i.itemId?.toString() === qid.toString(),
    );
    if (quizEntry) {
      quizEntry.status = "done";
      await enrollment.save();
    }

    res.json({
      success: true,
      itemsProgress: enrollment.itemsProgress,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
