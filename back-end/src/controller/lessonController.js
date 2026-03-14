const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { LESSON_COMPLETE_THRESHOLD } = require("../models/Enrollment");
const { buildItemsProgress } = require("../utils/buildItemsProgress");

function countLessonItems(sections) {
  let n = 0;
  (sections || []).forEach(sec => {
    n += (sec.items || []).filter(i => i.itemType === "lesson").length;
  });
  return n;
}

/** Cập nhật enrollment.progress và completed từ itemsProgress (chỉ đếm lesson done). */
function recalcProgressFromItemsProgress(enrollment, totalLessons) {
  if (totalLessons === 0) return;
  const doneCount = (enrollment.itemsProgress || []).filter(
    (i) => i.itemType === "lesson" && i.status === "done"
  ).length;
  enrollment.progress = Math.round((doneCount / totalLessons) * 100);
  if (enrollment.progress >= 100) enrollment.completed = true;
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
        success: true,
        progress: enrollment.progress,
        completed: enrollment.completed,
        itemsProgress: enrollment.itemsProgress || []
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
      (i) => i.itemType === "lesson" && i.itemId?.toString() === lidStr
    );
    if (lessonEntry) {
      lessonEntry.status = "done";
      const lessonIndexes = items
        .map((i, idx) => (i.itemType === "lesson" ? idx : -1))
        .filter((idx) => idx >= 0);
      const currentIdx = items.indexOf(lessonEntry);
      const nextLessonIdx = lessonIndexes.find((idx) => idx > currentIdx);
      if (nextLessonIdx !== undefined && items[nextLessonIdx]) {
        items[nextLessonIdx].status = "progress";
      }
    }
    recalcProgressFromItemsProgress(enrollment, totalLessons);

    await enrollment.save();

    res.json({
      success: true,
      progress: enrollment.progress,
      completed: enrollment.completed,
      itemsProgress: enrollment.itemsProgress
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

    const lid = mongoose.Types.ObjectId.isValid(lessonId)
      ? new mongoose.Types.ObjectId(lessonId)
      : null;
    if (!lid) {
      return res.status(400).json({ success: false, message: "Invalid lesson id" });
    }
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
        itemsProgress: []
      });
    }

    const lidStr = lid.toString();
    const lessonEntry = items.find(
      (i) => i.itemType === "lesson" && i.itemId?.toString() === lidStr
    );
    if (!lessonEntry) {
      return res.json({
        success: true,
        progress: enrollment.progress,
        completed: enrollment.completed,
        itemsProgress: enrollment.itemsProgress
      });
    }

    lessonEntry.watchedSeconds = (lessonEntry.watchedSeconds || 0) + delta;
    const duration = lessonEntry.duration || 0;
    const threshold = duration * LESSON_COMPLETE_THRESHOLD;

    if (lessonEntry.status !== "done" && lessonEntry.watchedSeconds >= threshold) {
      lessonEntry.status = "done";
      const currentIdx = items.indexOf(lessonEntry);
      const lessonIndexes = items
        .map((i, idx) => (i.itemType === "lesson" ? idx : -1))
        .filter((idx) => idx >= 0);
      const nextLessonIdx = lessonIndexes.find((idx) => idx > currentIdx);
      if (nextLessonIdx !== undefined && items[nextLessonIdx]) {
        items[nextLessonIdx].status = "progress";
      }
      const totalLessons = items.filter((i) => i.itemType === "lesson").length;
      recalcProgressFromItemsProgress(enrollment, totalLessons);
    }

    await enrollment.save();

    res.json({
      success: true,
      progress: enrollment.progress,
      completed: enrollment.completed,
      itemsProgress: enrollment.itemsProgress
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
      return res.status(400).json({ success: false, message: "Invalid lesson id" });
    }

    const items = enrollment.itemsProgress || [];
    if (items.length === 0) {
      return res.json({ success: true, allowed: true });
    }

    const entry = items.find(
      (i) => i.itemType === "lesson" && i.itemId?.toString() === lid.toString()
    );
    if (!entry) {
      return res.json({ success: true, allowed: true });
    }
    if (entry.status === "lock") {
      return res.status(403).json({
        success: false,
        allowed: false,
        message: "Hoàn thành bài trước để mở khóa.",
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

    const qid = mongoose.Types.ObjectId.isValid(quizId)
      ? new mongoose.Types.ObjectId(quizId)
      : null;
    if (!qid) {
      return res.status(400).json({ success: false, message: "Invalid quiz id" });
    }

    const items = enrollment.itemsProgress || [];
    const quizEntry = items.find(
      (i) => i.itemType === "quiz" && i.itemId?.toString() === qid.toString()
    );
    if (quizEntry) {
      quizEntry.status = "done";
      await enrollment.save();
    }

    res.json({
      success: true,
      itemsProgress: enrollment.itemsProgress
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};