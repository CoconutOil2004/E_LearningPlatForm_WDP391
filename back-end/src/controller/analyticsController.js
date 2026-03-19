const mongoose = require("mongoose");
const { Course, User, Order, Category, Enrollment } = require("../models");
const logger = require("../utils/logger");

/**
 * Get platform-wide analytics for Admin
 */
const getAdminAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      revenueByMonth,
      userDistribution,
      categoryDistribution,
      topCourses,
      avgPlatformRating
    ] = await Promise.all([
      // 1. Revenue by Month (Last 6 months)
      Order.aggregate([
        { 
          $match: { 
            status: 'paid', 
            createdAt: { $gte: sixMonthsAgo } 
          } 
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            revenue: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),

      // 2. User Distribution (Admin, Instructor, Student)
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ]),

      // 3. Category Distribution (Courses per category)
      Course.aggregate([
        {
          $group: {
            _id: "$category",
            courseCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryDetails"
          }
        },
        { $unwind: "$categoryDetails" },
        {
          $project: {
            name: "$categoryDetails.name",
            value: "$courseCount"
          }
        }
      ]),

      // 4. Top 5 Courses by Revenue
      Order.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: "$courseId",
            totalRevenue: { $sum: "$amount" },
            salesCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "_id",
            as: "courseInfo"
          }
        },
        { $unwind: "$courseInfo" },
        {
          $project: {
            title: "$courseInfo.title",
            revenue: "$totalRevenue",
            sales: "$salesCount",
            rating: "$courseInfo.rating"
          }
        }
      ]),

      // 5. Platform Average Rating
      Course.aggregate([
        { 
          $group: { 
            _id: null, 
            avgRating: { $avg: "$rating" } 
          } 
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        revenueByMonth,
        userDistribution,
        categoryDistribution,
        topCourses,
        avgPlatformRating: avgPlatformRating[0]?.avgRating || 0
      }
    });
  } catch (error) {
    logger.error("Error fetching admin analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get analytics for a specific Instructor
 */
const getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user._id;

    // Find all courses by this instructor
    const instructorCourses = await Course.find({ instructorId }).select("_id title status rating enrollmentCount price");
    const activeCoursesCount = instructorCourses.filter(c => c.status === 'published').length;
    const courseIds = instructorCourses.map(c => c._id);

    // Calculate total enrollments from Enrollment collection for accuracy
    const totalEnrolls = await Enrollment.countDocuments({ 
      courseId: { $in: courseIds } 
    });

    const [
      revenueByCourse,
      enrollmentTrend,
      avgInstructorRating
    ] = await Promise.all([
      // 1. Revenue split by Course (only paid orders)
      Order.aggregate([
        {
          $match: {
            courseId: { $in: courseIds },
            status: 'paid'
          }
        },
        {
          $group: {
            _id: "$courseId",
            revenue: { $sum: "$amount" },
            sales: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "_id",
            as: "courseInfo"
          }
        },
        { $unwind: "$courseInfo" },
        {
          $project: {
            name: "$courseInfo.title",
            revenue: 1,
            sales: 1,
            rating: "$courseInfo.rating"
          }
        }
      ]),

      // 2. Enrollment trend (Last 30 days) - Using Enrollment model to include free courses
      Enrollment.aggregate([
        {
          $match: {
            courseId: { $in: courseIds },
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]),

      // 3. Instructor Average Rating
      Course.aggregate([
        { $match: { instructorId: new mongoose.Types.ObjectId(instructorId) } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" }
          }
        }
      ])
    ]);

    // Merge revenue info into all instructor courses to ensure we show courses with 0 sales too
    const finalCoursePerformance = instructorCourses.map(course => {
      const revenueData = revenueByCourse.find(r => r._id.toString() === course._id.toString());
      return {
        _id: course._id,
        name: course.title,
        revenue: revenueData?.revenue || 0,
        sales: course.enrollmentCount || 0, // Using enrollmentCount from course model (includes free)
        rating: course.rating || 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      data: {
        revenueByCourse: finalCoursePerformance,
        enrollmentTrend,
        avgInstructorRating: avgInstructorRating[0]?.avgRating || 0,
        totalEnrolls,
        activeCourses: activeCoursesCount
      }
    });
  } catch (error) {
    logger.error("Error fetching instructor analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAdminAnalytics,
  getInstructorAnalytics
};
