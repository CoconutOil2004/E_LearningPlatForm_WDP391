const mongoose = require("mongoose");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const { cloudinary } = require("../config/cloudinary");

/** Lấy course và kiểm tra user là instructor (trả về course hoặc gửi res + return) */
async function getCourseAndEnsureInstructor(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid course id" });
    return null;
  }
  const course = await Course.findById(id);
  if (!course) {
    res.status(404).json({ message: "Course not found" });
    return null;
  }
  if (course.instructorId.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: "Not the course instructor" });
    return null;
  }
  return course;
}

/** Upload buffer video lên Cloudinary, trả về { url, publicId, duration } */
function uploadVideoToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "elearning-videos"
      },
      (err, result) => {
        if (err) return reject(err);
        const duration = result?.duration ? Math.round(Number(result.duration)) : 0;
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          duration
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/* ====================== SECTION ====================== */

/** POST /api/courses/:id/sections – Thêm section (items mặc định []) */
exports.addSection = async (req, res) => {
  try {
    const course = await getCourseAndEnsureInstructor(req, res);
    if (!course) return;

    const { title } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "title của chương là bắt buộc." });
    }

    course.sections.push({ title: title.trim(), items: [] });
    await course.save();

    res.status(201).json({
      success: true,
      data: course.sections[course.sections.length - 1]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** PUT /api/courses/:id/sections/:sectionIndex – Đổi tên section */
exports.updateSection = async (req, res) => {
  try {
    const course = await getCourseAndEnsureInstructor(req, res);
    if (!course) return;

    const sectionIndex = parseInt(req.params.sectionIndex, 10);
    if (isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= course.sections.length) {
      return res.status(400).json({ message: "sectionIndex không hợp lệ." });
    }

    const { title } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "title là bắt buộc." });
    }

    course.sections[sectionIndex].title = title.trim();
    await course.save();

    res.json({
      success: true,
      data: course.sections[sectionIndex]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** DELETE /api/courses/:id/sections/:sectionIndex – Xóa section và các Lesson/Quiz con */
exports.deleteSection = async (req, res) => {
  try {
    const course = await getCourseAndEnsureInstructor(req, res);
    if (!course) return;

    const sectionIndex = parseInt(req.params.sectionIndex, 10);
    if (isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= course.sections.length) {
      return res.status(400).json({ message: "sectionIndex không hợp lệ." });
    }

    const section = course.sections[sectionIndex];
    const itemIds = (section.items || []).map((i) => i.itemId).filter(Boolean);

    for (const id of itemIds) {
      const item = section.items.find((x) => x.itemId && x.itemId.toString() === id.toString());
      if (item?.itemType === "lesson") {
        const lesson = await Lesson.findById(id);
        if (lesson?.videoPublicId) {
          try {
            await cloudinary.uploader.destroy(lesson.videoPublicId, { resource_type: "video" });
          } catch (e) {
            console.warn("Cloudinary delete video failed:", e?.message);
          }
        }
        await Lesson.findByIdAndDelete(id);
      } else if (item?.itemType === "quiz") {
        await Quiz.findByIdAndDelete(id);
      }
    }

    course.sections.splice(sectionIndex, 1);
    await course.save();

    res.json({ success: true, message: "Section đã xóa." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ====================== LESSON ====================== */

/** POST /api/courses/:id/sections/:sectionIndex/lessons – Thêm lesson (video + item) */
exports.addLesson = async (req, res) => {
  try {
    const course = await getCourseAndEnsureInstructor(req, res);
    if (!course) return;

    const sectionIndex = parseInt(req.params.sectionIndex, 10);
    if (isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= course.sections.length) {
      return res.status(400).json({ message: "sectionIndex không hợp lệ." });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Cần gửi file video (field: video)." });
    }

    const title = (req.body.title && req.body.title.trim()) || "Bài học mới";

    const { url, publicId, duration } = await uploadVideoToCloudinary(req.file.buffer);

    const lesson = await Lesson.create({
      title,
      videoUrl: url,
      videoPublicId: publicId,
      duration,
      courseId: course._id
    });

    const section = course.sections[sectionIndex];
    const orderIndex = (section.items?.length || 0) + 1;
    section.items.push({
      itemType: "lesson",
      itemRef: "Lesson",
      itemId: lesson._id,
      title,
      orderIndex
    });
    await course.save();

    const totalDuration = (course.totalDuration || 0) + duration;
    await Course.findByIdAndUpdate(course._id, { totalDuration });

    const added = section.items[section.items.length - 1];
    res.status(201).json({
      success: true,
      data: {
        item: added,
        lesson: { _id: lesson._id, title: lesson.title, duration: lesson.duration, videoUrl: lesson.videoUrl }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ====================== QUIZ ====================== */

/** POST /api/courses/:id/sections/:sectionIndex/quizzes – Thêm quiz + item */
exports.addQuiz = async (req, res) => {
  try {
    const course = await getCourseAndEnsureInstructor(req, res);
    if (!course) return;

    const sectionIndex = parseInt(req.params.sectionIndex, 10);
    if (isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= course.sections.length) {
      return res.status(400).json({ message: "sectionIndex không hợp lệ." });
    }

    const { title, questions } = req.body;
    const trimmedTitle = (title && title.trim()) || "Quiz";
    const questionList = Array.isArray(questions) ? questions : [];

    const quiz = await Quiz.create({
      title: trimmedTitle,
      courseId: course._id,
      questions: questionList
    });

    const section = course.sections[sectionIndex];
    const orderIndex = (section.items?.length || 0) + 1;
    section.items.push({
      itemType: "quiz",
      itemRef: "Quiz",
      itemId: quiz._id,
      title: trimmedTitle,
      orderIndex
    });
    await course.save();

    const added = section.items[section.items.length - 1];
    res.status(201).json({
      success: true,
      data: { item: added, quiz: { _id: quiz._id, title: quiz.title, questions: quiz.questions } }
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

/* ====================== CURRICULUM (Preview) ====================== */

/** GET /api/courses/:id/curriculum – Lấy khung chương trình (populate refPath) */
exports.getCurriculum = async (req, res) => {
  try {
    const course = await getCourseAndEnsureInstructor(req, res);
    if (!course) return;

    const populated = await Course.findById(course._id)
      .populate({
        path: "sections.items.itemId"
      })
      .select("title status sections totalDuration")
      .lean();

    res.json({
      success: true,
      data: {
        title: populated.title,
        status: populated.status,
        totalDuration: populated.totalDuration || 0,
        sections: populated.sections || []
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
