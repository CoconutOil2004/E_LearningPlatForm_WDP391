const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

/**
 * Lấy danh sách items (lesson + quiz) theo đúng thứ tự syllabus:
 * - Giữ nguyên thứ tự section trong course.sections (section 1 trước, section 2 sau, ...)
 * - Trong mỗi section, sort items theo orderIndex
 * FIX: KHÔNG sort global vì orderIndex được đặt độc lập trong từng section
 *      (vd: bài 1 chương 2 có orderIndex=0, nhỏ hơn bài 2 chương 1 có orderIndex=1,
 *       nếu sort global thì bài chương 2 sẽ bị đưa lên trước → unlock sai thứ tự).
 * @param {Array} sections - course.sections
 * @returns {Array} [{ itemId, itemType, orderIndex }, ...]
 */
function getOrderedItems(sections) {
  const list = [];
  (sections || []).forEach((sec) => {
    // Sort items bên trong section theo orderIndex, KHÔNG sort toàn cục
    const sectionItems = [...(sec.items || [])].sort(
      (a, b) =>
        (a.orderIndex != null ? a.orderIndex : 0) -
        (b.orderIndex != null ? b.orderIndex : 0),
    );
    sectionItems.forEach((it) => {
      list.push({
        itemId: it.itemId,
        itemType: it.itemType === "quiz" ? "quiz" : "lesson",
        orderIndex: it.orderIndex != null ? it.orderIndex : 0,
      });
    });
  });
  return list;
}

/**
 * Build mảng itemsProgress khi enroll: đổ full khung khóa, lesson có duration từ Lesson gốc.
 * Lesson đầu tiên = "progress" (mở sẵn), còn lại = "lock". Quiz = "open".
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
      { duration: 1 },
    ).lean();
    lessons.forEach((l) => {
      lessonDurations[l._id.toString()] = Number(l.duration) || 0;
    });
  }

  let firstLessonSeen = false;
  const itemsProgress = orderedItems.map((it) => {
    const idStr = it.itemId?.toString?.() || String(it.itemId);
    if (it.itemType === "lesson") {
      const status = firstLessonSeen ? "lock" : "progress";
      firstLessonSeen = true;
      return {
        itemId: it.itemId,
        itemType: "lesson",
        status,
        watchedSeconds: 0,
        duration: lessonDurations[idStr] || 0,
      };
    }
    return {
      itemId: it.itemId,
      itemType: "quiz",
      status: "open",
    };
  });

  return itemsProgress;
}

module.exports = { buildItemsProgress, getOrderedItems };
