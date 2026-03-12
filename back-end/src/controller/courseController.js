const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const { validateCategoryId } = require("./categoryController");
const { cloudinary } = require("../config/cloudinary");

/** Enum level dùng cho validation (trùng với Course schema). FE có thể gọi GET /api/courses/levels để lấy. */
const LEVEL_ENUM = ["Beginner", "Intermediate", "Advanced"];
exports.LEVEL_ENUM = LEVEL_ENUM;

/** Upload buffer video lên Cloudinary, trả về { videoUrl, publicId, duration } */
function uploadVideoToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "elearning-videos" },
      (err, result) => {
        if (err) return reject(err);
        const duration = result?.duration
          ? Math.round(Number(result.duration))
          : 0;
        resolve({
          videoUrl: result.secure_url,
          publicId: result.public_id,
          duration,
        });
      },
    );
    uploadStream.end(buffer);
  });
}

/* =====================================================
   SEARCH COURSES (Udemy Style)
===================================================== */
exports.searchCourses = async (req, res) => {
  try {
    let {
      keyword,
      category,
      level,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      page,
      limit,
      myCourses,
    } = req.query;

    /* ======================
       SAFE PARSE
    ====================== */
    page = Number.isInteger(+page) ? Math.max(+page, 1) : 1;
    limit = Number.isInteger(+limit) ? Math.min(Math.max(+limit, 1), 50) : 10;

    const query = { status: "published" };

    /* ======================
       KEYWORD SEARCH
    ====================== */
    if (keyword?.trim()) {
      query.$text = { $search: keyword.trim() };
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = new mongoose.Types.ObjectId(category);
    }
    if (level) query.level = level;

    /* ======================
       PRICE FILTER
    ====================== */
    if (minPrice || maxPrice) {
      query.price = {};

      if (!isNaN(minPrice)) query.price.$gte = Number(minPrice);

      if (!isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
    }

    /* ======================
       RATING FILTER
    ====================== */
    if (!isNaN(minRating)) {
      query.rating = { $gte: Number(minRating) };
    }

    /* ======================
       USER ENROLLMENTS
    ====================== */
    let purchasedCourseIds = [];
    const userId = req.user?._id || null;

    if (userId) {
      const enrollments = await Enrollment.find({
        userId,
        paymentStatus: "paid",
      }).select("courseId");

      purchasedCourseIds = enrollments.map((e) => e.courseId.toString());

      /* My courses only */
      if (myCourses === "true") {
        query._id = {
          $in: purchasedCourseIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }
    } else if (myCourses === "true") {
      return res.json({
        success: true,
        total: 0,
        page: 1,
        pages: 0,
        data: [],
      });
    }

    /* ======================
       SORT (Udemy Logic)
    ====================== */
    let sortOption = { createdAt: -1 };

    switch (sortBy) {
      case "priceAsc":
        sortOption = { price: 1 };
        break;
      case "priceDesc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "popular":
        sortOption = { enrollmentCount: -1 };
        break;
    }

    /* text search priority */
    if (keyword) {
      sortOption = {
        score: { $meta: "textScore" },
        ...sortOption,
      };
    }

    /* ======================
       PROJECTION
    ====================== */
    const projection = keyword ? { score: { $meta: "textScore" } } : {};

    /* ======================
       QUERY + COUNT PARALLEL
    ====================== */
    const [courses, total] = await Promise.all([
      Course.find(query, projection)
        .populate("instructorId", "fullname email")
        .populate("category", "name slug description")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Course.countDocuments(query),
    ]);

    /* ======================
       ADD isEnrolled FLAG
    ====================== */
    const result = courses.map((course) => ({
      ...course,
      isEnrolled: purchasedCourseIds.includes(course._id.toString()),
    }));

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

/* =====================================================
   DANH SÁCH KHÓA HỌC THEO CATEGORY (public)
   GET /api/courses/by-category/:categoryId?page=1&limit=10&sortBy=...
===================================================== */
exports.getCoursesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let { page = 1, limit = 10, sortBy } = req.query;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "categoryId không hợp lệ",
      });
    }

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const query = {
      status: "published",
      category: new mongoose.Types.ObjectId(categoryId),
    };

    let sortOption = { createdAt: -1 };
    switch (sortBy) {
      case "priceAsc":
        sortOption = { price: 1 };
        break;
      case "priceDesc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "popular":
        sortOption = { enrollmentCount: -1 };
        break;
      default:
        break;
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructorId", "fullname email avatarURL")
        .populate("category", "name slug description")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message:
        error.message || "Lỗi server khi lấy danh sách khóa học theo category",
    });
  }
};

/* =====================================================
   CREATE COURSE (Instructor) – Yêu cầu 1
   title bắt buộc max 60, categoryId bắt buộc tồn tại, level enum.
   Mặc định status: draft, price: 0. Response 201 + populate category name.
===================================================== */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, categoryId, level } = req.body;
    const instructorId = req.user._id;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res
        .status(400)
        .json({ message: "title: Bắt buộc, không được để trống." });
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 60) {
      return res.status(400).json({ message: "title: Tối đa 60 ký tự." });
    }

    if (!categoryId) {
      return res
        .status(400)
        .json({ message: "categoryId: Bắt buộc phải chọn thể loại." });
    }
    const categoryValidation = await validateCategoryId(categoryId);
    if (!categoryValidation.valid) {
      return res
        .status(400)
        .json({ message: "categoryId: " + categoryValidation.error });
    }

    if (!level || !LEVEL_ENUM.includes(level)) {
      return res.status(400).json({
        message:
          "level: Bắt buộc, giá trị phải là một trong: " +
          LEVEL_ENUM.join(", "),
      });
    }

    const course = await Course.create({
      title: trimmedTitle,
      description: (description || "").trim(),
      category: categoryValidation.category._id,
      level,
      price: 0,
      status: "draft",
      instructorId,
    });

    const populated = await Course.findById(course._id)
      .populate("instructorId", "fullname email")
      .populate("category", "name")
      .lean();

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: err.message || "Dữ liệu không hợp lệ." });
    }
    res.status(500).json({ message: err.message || "Lỗi server." });
  }
};

/* =====================================================
   GET COURSE PREVIEW (public) – syllabus only, không trả videoUrl
   Chỉ khóa published. Cho người chưa enroll xem cấu trúc khóa.
===================================================== */
exports.getCoursePreview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findOne({ _id: id, status: "published" })
      .select(
        "title description price level rating enrollmentCount totalDuration category instructorId sections",
      )
      .populate("category", "name slug description")
      .populate("instructorId", "fullname")
      .populate({ path: "sections.items.itemId", select: "title duration" })
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const sections = (course.sections || []).map((sec) => ({
      _id: sec._id,
      title: sec.title,
      items: (sec.items || []).map((it) => {
        const item = { ...it };
        if (it.itemId) {
          if (it.itemType === "lesson") {
            item.itemId = {
              _id: it.itemId._id,
              title: it.itemId.title,
              duration: it.itemId.duration ?? 0,
            };
          } else {
            item.itemId = { _id: it.itemId._id, title: it.itemId.title };
          }
        }
        return item;
      }),
    }));

    res.json({
      success: true,
      data: {
        _id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        level: course.level,
        rating: course.rating,
        enrollmentCount: course.enrollmentCount,
        totalDuration: course.totalDuration,
        category: course.category,
        instructorId: course.instructorId,
        sections,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   GET COURSE DETAIL – full (videoUrl + questions)
   Admin / Instructor của khóa: vào được luôn.
   Student: chỉ vào được nếu đã enroll (đã mua khóa).
===================================================== */
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findById(id)
      .populate("category", "name slug description")
      .populate("instructorId", "fullname email")
      .populate({ path: "sections.items.itemId" })
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const instructorIdStr =
      course.instructorId?._id?.toString() || course.instructorId?.toString();
    const isInstructor =
      instructorIdStr && req.user._id.toString() === instructorIdStr;
    const isAdmin = req.user.role === "admin";

    if (isAdmin || isInstructor) {
      return res.json({ success: true, data: course });
    }

    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: id,
      paymentStatus: "paid",
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "Bạn cần mua khóa học để xem nội dung." });
    }

    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   UPDATE COURSE (CRUD) – nhận cả sections từ FE, đổ vào và lưu
   Body: title?, description?, categoryId?, level?, price?, status?, sections?
   sections = [ { title, items: [ { itemType, itemRef, title, orderIndex, itemId?, videoUrl?, duration?, videoPublicId?, questions? } ] } ]
   Item không có itemId → BE tạo Lesson/Quiz mới. ItemId cũ không còn trong payload → xóa Lesson/Quiz tương ứng.
===================================================== */
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      categoryId,
      level,
      price,
      status,
      sections: bodySections,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not the course instructor" });
    }

    if (["pending", "published"].includes(course.status)) {
      return res.status(400).json({
        message: `Cannot update course while it is ${course.status}. Please move it back to draft first.`,
      });
    }

    if (categoryId !== undefined) {
      const categoryValidation = await validateCategoryId(categoryId || null);
      if (!categoryValidation.valid) {
        return res.status(400).json({ message: categoryValidation.error });
      }
      course.category = categoryValidation.category?._id || null;
    }

    if (title !== undefined) course.title = title.trim();
    if (description !== undefined) course.description = description.trim();
    if (level !== undefined) course.level = level;
    if (price !== undefined) course.price = Number(price);
    if (
      status !== undefined &&
      ["draft", "pending", "published", "rejected", "archived"].includes(status)
    ) {
      course.status = status;
    }
    if (thumbnail !== undefined) {
      course.thumbnail = (thumbnail && String(thumbnail).trim()) || null;
    }

    const oldItemIds = new Set();
    (course.sections || []).forEach((sec) => {
      (sec.items || []).forEach((it) => {
        if (it.itemId) oldItemIds.add(it.itemId.toString());
      });
    });

    if (Array.isArray(bodySections)) {
      const newSections = [];
      const newItemIds = new Set();
      let totalDuration = 0;

      for (const sec of bodySections) {
        const sectionTitle =
          (sec.title && String(sec.title).trim()) || "Section";
        const newItems = [];
        const items = Array.isArray(sec.items) ? sec.items : [];
        let orderIndex = 0;

        for (const it of items) {
          orderIndex += 1;
          const itemTitle =
            (it.title && String(it.title).trim()) ||
            (it.itemType === "quiz" ? "Quiz" : "Bài học");
          const itemType = it.itemType === "quiz" ? "quiz" : "lesson";
          const itemRef = itemType === "quiz" ? "Quiz" : "Lesson";

          let itemId =
            it.itemId && mongoose.Types.ObjectId.isValid(it.itemId)
              ? new mongoose.Types.ObjectId(it.itemId)
              : null;

          if (!itemId) {
            if (itemType === "lesson") {
              const videoUrl =
                it.videoUrl && String(it.videoUrl).trim()
                  ? String(it.videoUrl).trim()
                  : "";
              const lesson = await Lesson.create({
                title: itemTitle,
                videoUrl: videoUrl || null,
                videoPublicId:
                  (it.videoPublicId && String(it.videoPublicId).trim()) || null,
                duration: Math.max(0, Number(it.duration) || 0),
                courseId: course._id,
              });
              itemId = lesson._id;
              totalDuration += lesson.duration;
            } else {
              const questionList = Array.isArray(it.questions)
                ? it.questions
                : [];
              const quiz = await Quiz.create({
                title: itemTitle,
                courseId: course._id,
                questions: questionList,
              });
              itemId = quiz._id;
            }
          } else {
            const existing = await Lesson.findById(itemId)
              .select("duration")
              .lean();
            if (existing) totalDuration += existing.duration || 0;
          }

          newItemIds.add(itemId.toString());
          newItems.push({
            itemType,
            itemRef,
            itemId,
            title: itemTitle,
            orderIndex,
          });
        }

        newSections.push({ title: sectionTitle, items: newItems });
      }

      for (const oldId of oldItemIds) {
        if (newItemIds.has(oldId)) continue;
        const lesson = await Lesson.findById(oldId)
          .select("videoPublicId")
          .lean();
        if (lesson) {
          if (lesson.videoPublicId) {
            try {
              await cloudinary.uploader.destroy(lesson.videoPublicId, {
                resource_type: "video",
              });
            } catch (e) {
              console.warn("Cloudinary delete video failed:", e?.message);
            }
          }
          await Lesson.findByIdAndDelete(oldId);
        } else {
          await Quiz.findByIdAndDelete(oldId);
        }
      }

      course.sections = newSections;
      course.totalDuration = totalDuration;
    }

    await course.save();

    const populated = await Course.findById(course._id)
      .populate("instructorId", "fullname email")
      .populate("category", "name slug description")
      .populate({ path: "sections.items.itemId" })
      .lean();

    res.json({ success: true, data: populated });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

/* ====================== UPLOAD VIDEO (FE gọi trước, rồi gửi url vào PUT course sections) ====================== */
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ message: "Cần gửi file video (field: video)." });
    }
    const data = await uploadVideoToCloudinary(req.file.buffer);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload video thất bại." });
  }
};

/* =====================================================
   SUBMIT COURSE (Instructor)
===================================================== */
exports.submitCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not the course instructor" });
    }

    if (!["draft", "rejected"].includes(course.status)) {
      return res.status(400).json({
        message: `Cannot submit course with status: ${course.status}`,
      });
    }

    course.status = "pending";
    await course.save();

    res.json({
      success: true,
      message: "Course submitted for review",
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   ADMIN: GET PENDING COURSES
===================================================== */
exports.getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "pending" })
      .populate("instructorId", "fullname email")
      .populate("category", "name")
      .sort({ updatedAt: 1 })
      .lean();

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   ADMIN: APPROVE COURSE
===================================================== */
exports.approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.status !== "pending") {
      return res.status(400).json({
        message: `Cannot approve course with status: ${course.status}`,
      });
    }

    course.status = "published";
    await course.save();

    res.json({
      success: true,
      message: "Course approved and published",
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   ADMIN: REJECT COURSE
===================================================== */
exports.rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject course with status: ${course.status}`,
      });
    }

    course.status = "rejected";
    await course.save();

    res.json({
      success: true,
      message: "Course rejected",
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   INSTRUCTOR: GET MY COURSES (all statuses)
   GET /api/courses/instructor/mine
   Query: status? ("draft"|"pending"|"published"|"rejected"|"archived")
===================================================== */
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { status } = req.query;

    const query = { instructorId };
    if (
      status &&
      ["draft", "pending", "published", "rejected", "archived"].includes(status)
    ) {
      query.status = status;
    }

    const courses = await Course.find(query)
      .populate("instructorId", "fullname email avatarURL")
      .populate("category", "name slug description")
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
