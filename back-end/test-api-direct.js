// Test certificate API endpoints directly
require('dotenv').config();
const mongoose = require('mongoose');

async function testAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'E_Learning',
    });
    console.log('✅ Connected to MongoDB\n');

    // Import models after connection
    const Enrollment = require('./src/models/Enrollment');
    const User = require('./src/models/User');
    const Course = require('./src/models/Course');

    // Test 1: Get approved certificates
    console.log('📋 Test 1: getMyCertificates (approved only)');
    const userId = '679e5e0e0e0e0e0e0e0e0e01'; // Replace with real userId
    const approved = await Enrollment.find({
      completed: true,
      certificateStatus: 'approved'
    })
      .populate({
        path: 'courseId',
        select: 'title thumbnail instructorId',
        populate: { path: 'instructorId', select: 'fullname email' }
      })
      .populate('certificateApprovedBy', 'fullname')
      .lean();

    console.log(`   Found ${approved.length} approved certificates`);
    approved.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.courseId?.title} (courseId: ${e.courseId?._id})`);
    });

    // Test 2: Get certificate status for a specific course
    if (approved.length > 0) {
      const testCourseId = approved[0].courseId._id;
      const testUserId = approved[0].userId;
      
      console.log(`\n📋 Test 2: getCertificateStatus for course ${testCourseId}`);
      const status = await Enrollment.findOne({
        userId: testUserId,
        courseId: testCourseId,
        paymentStatus: 'paid'
      })
        .select('progress completed certificateStatus certificateApprovedAt certificateRejectionReason')
        .lean();

      if (status) {
        console.log('   Status found:', {
          progress: status.progress,
          completed: status.completed,
          certificateStatus: status.certificateStatus,
          certificateApprovedAt: status.certificateApprovedAt
        });
      } else {
        console.log('   ❌ Status not found');
      }
    }

    console.log('\n✅ All tests completed');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testAPI();
