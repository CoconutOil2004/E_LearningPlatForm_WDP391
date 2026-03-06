const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { validateCategoryId } = require("./categoryController");

/** Enum level dùng cho validation (trùng với Course schema). FE có thể gọi GET /api/courses/levels để lấy. */
const LEVEL_ENUM = ["Beginner", "Intermediate", "Advanced"];
exports.LEVEL_ENUM = LEVEL_ENUM;

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
      myCourses
    } = req.query;

    /* ======================
       SAFE PARSE
    ====================== */
    page = Number.isInteger(+page) ? Math.max(+page, 1) : 1;
    limit = Number.isInteger(+limit)
      ? Math.min(Math.max(+limit, 1), 50)
      : 10;

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

      if (!isNaN(minPrice))
        query.price.$gte = Number(minPrice);

      if (!isNaN(maxPrice))
        query.price.$lte = Number(maxPrice);
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
        paymentStatus: "paid"
      }).select("courseId");

      purchasedCourseIds = enrollments.map(e =>
        e.courseId.toString()
      );

      /* My courses only */
      if (myCourses === "true") {
        query._id = {
          $in: purchasedCourseIds.map(
            id => new mongoose.Types.ObjectId(id)
          )
        };
      }
    } else if (myCourses === "true") {
      return res.json({
        success: true,
        total: 0,
        page: 1,
        pages: 0,
        data: []
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
        ...sortOption
      };
    }

    /* ======================
       PROJECTION
    ====================== */
    const projection = keyword
      ? { score: { $meta: "textScore" } }
      : {};

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

      Course.countDocuments(query)
    ]);

    /* ======================
       ADD isEnrolled FLAG
    ====================== */
    const result = courses.map(course => ({
      ...course,
      isEnrolled: purchasedCourseIds.includes(
        course._id.toString()
      )
    }));

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
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
      return res.status(400).json({ message: "title: Bắt buộc, không được để trống." });
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 60) {
      return res.status(400).json({ message: "title: Tối đa 60 ký tự." });
    }

    if (!categoryId) {
      return res.status(400).json({ message: "categoryId: Bắt buộc phải chọn thể loại." });
    }
    const categoryValidation = await validateCategoryId(categoryId);
    if (!categoryValidation.valid) {
      return res.status(400).json({ message: "categoryId: " + categoryValidation.error });
    }

    if (!level || !LEVEL_ENUM.includes(level)) {
      return res.status(400).json({
        message: "level: Bắt buộc, giá trị phải là một trong: " + LEVEL_ENUM.join(", ")
      });
    }

    const courseId = "C" + Date.now();
    const course = await Course.create({
      courseId,
      title: trimmedTitle,
      description: (description || "").trim(),
      category: categoryValidation.category._id,
      level,
      price: 0,
      status: "draft",
      instructorId
    });

    const populated = await Course.findById(course._id)
      .populate("instructorId", "fullname email")
      .populate("category", "name")
      .lean();

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message || "Dữ liệu không hợp lệ." });
    }
    res.status(500).json({ message: err.message || "Lỗi server." });
  }
};

/* =====================================================
   UPDATE COURSE – validates categoryId if provided
===================================================== */
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, categoryId, level, price, status } = req.body;

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
        message: `Cannot update course while it is ${course.status}. Please move it back to draft first.`
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
    if (status !== undefined && ["draft", "pending", "published", "rejected", "archived"].includes(status)) {
      course.status = status;
    }

    await course.save();

    const populated = await Course.findById(course._id)
      .populate("instructorId", "fullname email")
      .populate("category", "name slug description")
      .lean();

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =====================================================
   GET COURSE LESSONS (SECURE - Udemy Style)
   Curriculum: sections > items (lesson | quiz). Only lesson items returned.
===================================================== */
function getLessonItemsFromSections(sections) {
  const items = [];
  (sections || []).forEach(sec => {
    (sec.items || [])
      .filter(i => i.itemType === "lesson")
      .forEach(i => items.push({ ...i.toObject?.() || i, orderIndex: i.orderIndex }));
  });
  items.sort((a, b) => a.orderIndex - b.orderIndex);
  return items;
}

exports.getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findOne({
      _id: courseId,
      status: "published"
    })
      .select("title sections totalDuration")
      .populate({
        path: "sections.items.itemId",
        select: "duration",
        model: "Lesson"
      })
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lessonItems = getLessonItemsFromSections(course.sections);
    const lessons = lessonItems.map(item => ({
      _id: item.itemId?._id || item.itemId,
      title: item.title,
      duration: item.itemId?.duration ?? 0,
      order: item.orderIndex
    }));

    res.json({
      success: true,
      courseId: course._id,
      title: course.title,
      totalLessons: lessons.length,
      totalDuration: course.totalDuration ?? 0,
      lessons
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
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
        message: `Cannot submit course with status: ${course.status}`
      });
    }

    course.status = "pending";
    await course.save();

    res.json({
      success: true,
      message: "Course submitted for review",
      data: course
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
      data: courses
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
        message: `Cannot approve course with status: ${course.status}`
      });
    }

    course.status = "published";
    await course.save();

    res.json({
      success: true,
      message: "Course approved and published",
      data: course
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
        message: `Cannot reject course with status: ${course.status}`
      });
    }

    course.status = "rejected";
    // Optional: save rejection reason if model is updated to support it
    await course.save();

    res.json({
      success: true,
      message: "Course rejected",
      data: course
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};