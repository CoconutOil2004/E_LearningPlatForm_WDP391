const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

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
      page = 1,
      limit = 10,
      myCourses
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {
      status: "published"
    };

    /* ======================
       KEYWORD SEARCH
    ====================== */
    if (keyword) {
      query.$text = { $search: keyword };
    }

    if (category) query.category = category;
    if (level) query.level = level;

    /* PRICE */
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    /* RATING */
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    /* ======================
       GET USER ENROLLMENTS
    ====================== */
    let purchasedCourseIds = [];

    if (req.user) {
      const enrollments = await Enrollment.find({
        userId: req.user._id,
        paymentStatus: "paid"
      }).select("courseId");

      purchasedCourseIds = enrollments.map(e =>
        e.courseId.toString()
      );

      /* filter only my courses */
      if (myCourses === "true") {
        query._id = { $in: purchasedCourseIds };
      }
    }

    /* ======================
       SORT
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
      case "newest":
        sortOption = { createdAt: -1 };
        break;
    }

    /* ======================
       QUERY COURSES
    ====================== */
    const courses = await Course.find(query)
      .populate("instructorId", "fullName email")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    /* ======================
       ADD isEnrolled FIELD
    ====================== */
    const result = courses.map(course => ({
      ...course,
      isEnrolled: purchasedCourseIds.includes(
        course._id.toString()
      )
    }));

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: result
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};