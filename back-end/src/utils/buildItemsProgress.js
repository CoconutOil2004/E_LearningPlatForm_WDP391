const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

/**
 * Lấy danh sách items (lesson + quiz) theo thứ tự syllabus từ course.
 * @param {Array} sections - course.sections
 * @returns {Array} [{ itemId, itemType, orderIndex }, ...]
 */
function getOrderedItems(sections) {
  const list = [];
  (sections || []).forEach((sec) => {
    (sec.items || []).forEach((it) => {
      list.push({
        itemId: it.itemId,
        itemType: it.itemType === "quiz" ? "quiz" : "lesson",
        orderIndex: it.orderIndex != null ? it.orderIndex : 0
      });
    });
  });
  list.sort((a, b) => a.orderIndex - b.orderIndex);
  return list;
}

/**
 * Build mảng itemsProgress khi enroll: đổ full khung khóa, lesson có duration từ Lesson gốc.
 * Lesson đầu = progress, còn lại = lock. Quiz = open.
 * @param {string|ObjectId} courseId
 * @returns {Promise<Array>} Mảng item progress (itemId, itemType, status, watchedSeconds?, duration?)
 */
async function buildItemsProgress(courseId) {
  const course = await Course.findById(courseId).select("sections").lean();
  if (!course || !course.sections || course.sections.length === 0) {
    return [];
  }

  const orderedItems = getOrderedItems(course.sections);
  const lessonIds = orderedItems
    .filter((i) => i.itemType === "lesson")
    .map((i) => i.itemId);

  const lessonDurations = {};
  if (lessonIds.length > 0) {
    const lessons = await Lesson.find(
      { _id: { $in: lessonIds } },
      { duration: 1 }
    ).lean();
    lessons.forEach((l) => {
      lessonDurations[l._id.toString()] = Number(l.duration) || 0;
    });
  }

  let firstLessonSeen = false;
  const itemsProgress = orderedItems.map((it) => {
    const idStr = it.itemId?.toString?.() || it.itemId;
    if (it.itemType === "lesson") {
      const status = firstLessonSeen ? "lock" : "progress";
      firstLessonSeen = true;
      return {
        itemId: it.itemId,
        itemType: "lesson",
        status,
        watchedSeconds: 0,
        duration: lessonDurations[idStr] || 0
      };
    }
    return {
      itemId: it.itemId,
      itemType: "quiz",
      status: "open"
    };
  });

  return itemsProgress;
}

module.exports = { buildItemsProgress, getOrderedItems };
