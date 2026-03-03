const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

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

    if (category) query.category = category;
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
        .populate("instructorId", "fullName email")
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
   GET COURSE LESSONS (SECURE - Udemy Style)
===================================================== */
exports.getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    /* ======================
       VALIDATE OBJECT ID
    ====================== */
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course id"
      });
    }

    /* ======================
       FIND COURSE
    ====================== */
    const course = await Course.findOne({
      _id: courseId,
      status: "published"
    }).select("title lessons totalDuration");

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    /* ======================
       SORT + SANITIZE LESSONS
       (NO PRIVATE DATA LEAK)
    ====================== */
    const lessons = course.lessons
      .sort((a, b) => a.order - b.order)
      .map(lesson => ({
        _id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        order: lesson.order,
        isPreview: lesson.isPreview
      }));

    res.json({
      success: true,
      courseId: course._id,
      title: course.title,
      totalLessons: lessons.length,
      totalDuration: course.totalDuration,
      lessons
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};