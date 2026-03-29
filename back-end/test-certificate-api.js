// Quick test script for certificate APIs
require('dotenv').config();
const mongoose = require('mongoose');
const Enrollment = require('./src/models/Enrollment');
const User = require('./src/models/User');
const Course = require('./src/models/Course');

async function testCertificateAPI() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const dbName = process.env.DB_NAME || 'E_Learning';
    await mongoose.connect(process.env.MONGODB_URI, { dbName });
    console.log(`✅ Connected to database: ${dbName}\n`);

    // Check all enrollments
    const allEnrollments = await Enrollment.find({})
      .populate('userId', 'fullname email')
      .populate('courseId', 'title')
      .select('completed certificateStatus progress')
      .lean();

    console.log(`📊 Total enrollments: ${allEnrollments.length}\n`);
    
    allEnrollments.forEach((e, i) => {
      console.log(`${i + 1}. ${e.userId?.fullname || 'Unknown'} - ${e.courseId?.title || 'Unknown'}`);
      console.log(`   Progress: ${e.progress}%, Completed: ${e.completed}, Status: ${e.certificateStatus}`);
    });

    // Find an approved enrollment
    const approvedEnrollment = await Enrollment.findOne({
      certificateStatus: 'approved'
    })
      .populate('userId', 'fullname email')
      .populate('courseId', 'title')
      .lean();

    if (!approvedEnrollment) {
      console.log('\n❌ No approved enrollment found');
    } else {
      console.log('\n📋 Found approved enrollment:');
      console.log('   Student:', approvedEnrollment.userId?.fullname);
      console.log('   Course:', approvedEnrollment.courseId?.title);
      console.log('   CourseId:', approvedEnrollment.courseId?._id);
      console.log('   Status:', approvedEnrollment.certificateStatus);
      console.log('   Progress:', approvedEnrollment.progress);
      console.log('   Completed:', approvedEnrollment.completed);
    }
    
    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testCertificateAPI();
