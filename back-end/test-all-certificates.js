// Test all certificates in database
require('dotenv').config();
const mongoose = require('mongoose');

async function testAllCertificates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'E_Learning',
    });
    console.log('✅ Connected to MongoDB\n');

    const Enrollment = require('./src/models/Enrollment');
    const User = require('./src/models/User');
    const Course = require('./src/models/Course');

    // Get all completed enrollments
    const enrollments = await Enrollment.find({ completed: true })
      .populate('userId', 'fullname email')
      .populate('courseId', 'title')
      .lean();

    console.log(`📊 Total completed enrollments: ${enrollments.length}\n`);

    enrollments.forEach((e, i) => {
      console.log(`${i + 1}. ${e.courseId?.title || 'Unknown'}`);
      console.log(`   Student: ${e.userId?.fullname || 'Unknown'}`);
      console.log(`   Status: ${e.certificateStatus || 'undefined'}`);
      console.log(`   Approved At: ${e.certificateApprovedAt || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testAllCertificates();
