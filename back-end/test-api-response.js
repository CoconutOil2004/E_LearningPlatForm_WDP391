// Test API response structure
require('dotenv').config();
const mongoose = require('mongoose');

async function testAPIResponse() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'E_Learning',
    });
    console.log('✅ Connected to MongoDB\n');

    const Enrollment = require('./src/models/Enrollment');
    const User = require('./src/models/User');
    const Course = require('./src/models/Course');
    const { buildItemsProgress } = require('./src/utils/buildItemsProgress');

    const userEmail = 'duytspt009@gmail.com';
    const user = await User.findOne({ email: userEmail });

    // Simulate getMyCourses API
    const enrollments = await Enrollment.find({
      userId: user._id,
      paymentStatus: "paid",
    })
      .populate({
        path: "courseId",
        select: "title thumbnail instructorId category totalDuration sections rating enrollmentCount",
        populate: [
          { path: "instructorId", select: "fullname" },
          { path: "category", select: "name slug description" },
        ],
      })
      .sort({ updatedAt: -1 })
      .lean();

    console.log('📋 API Response Structure:\n');
    
    const filtered = enrollments.filter((e) => e.courseId);
    const data = await Promise.all(
      filtered.map(async (e) => {
        const course = e.courseId;
        
        return {
          enrollmentId: e._id,
          progress: e.progress,
          completed: e.completed,
          certificateStatus: e.certificateStatus,
          certificateApprovedAt: e.certificateApprovedAt,
          certificateRejectionReason: e.certificateRejectionReason,
          lastUpdated: e.updatedAt,
          course: {
            _id: course._id,
            title: course.title,
          },
        };
      }),
    );

    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testAPIResponse();
