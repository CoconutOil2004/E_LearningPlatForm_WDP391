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

    const query = {};

    /* ======================
       KEYWORD SEARCH
    ====================== */
    if (keyword) {
      query.$text = { $search: keyword };
    }

    /* ======================
       FILTER CATEGORY
    ====================== */
    if (category) {
      query.category = category;
    }

    /* ======================
       FILTER LEVEL
    ====================== */
    if (level) {
      query.level = level;
    }

    /* ======================
       FILTER PRICE
    ====================== */
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    /* ======================
       FILTER RATING
    ====================== */
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    /* ======================
       FILTER USER PURCHASED COURSES
    ====================== */
    if (myCourses === "true") {

      if (!req.user) {
        return res.status(401).json({
          message: "Login required"
        });
      }

      const enrollments = await Enrollment.find({
        userId: req.user.id
      }).select("courseId");

      const courseIds = enrollments.map(e => e.courseId);

      query._id = { $in: courseIds };
    }

    /* ======================
       ONLY PUBLISHED COURSE
    ====================== */
    query.status = "published";

    /* ======================
       SORTING
    ====================== */
    let sortOption = {};

    switch (sortBy) {
      case "priceAsc":
        sortOption.price = 1;
        break;

      case "priceDesc":
        sortOption.price = -1;
        break;

      case "rating":
        sortOption.rating = -1;
        break;

      case "popular":
        sortOption.enrollmentCount = -1;
        break;

      case "newest":
        sortOption.createdAt = -1;
        break;

      default:
        sortOption.createdAt = -1;
    }

    /* ======================
       EXECUTE QUERY
    ====================== */
    const courses = await Course.find(query)
      .populate("instructorId", "name email")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: courses
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
