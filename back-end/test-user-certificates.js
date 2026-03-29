// Test specific user's certificates
require('dotenv').config();
const mongoose = require('mongoose');

async function testUserCertificates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'E_Learning',
    });
    console.log('✅ Connected to MongoDB\n');

    const Enrollment = require('./src/models/Enrollment');
    const User = require('./src/models/User');
    const Course = require('./src/models/Course');

    // Find user by email
    const userEmail = 'duytspt009@gmail.com'; // Change this to your test user email
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ User not found: ${userEmail}`);
      process.exit(0);
    }

    console.log(`👤 User: ${user.fullname} (${user.email})`);
    console.log(`   ID: ${user._id}\n`);

    // Get all enrollments for this user
    const enrollments = await Enrollment.find({
      userId: user._id,
      paymentStatus: 'paid'
    })
      .populate('courseId', 'title')
      .lean();

    console.log(`📊 Total enrollments: ${enrollments.length}\n`);

    enrollments.forEach((e, i) => {
      console.log(`${i + 1}. ${e.courseId?.title || 'Unknown'}`);
      console.log(`   Progress: ${e.progress}%`);
      console.log(`   Completed: ${e.completed}`);
      console.log(`   Certificate Status: ${e.certificateStatus || 'undefined'}`);
      console.log(`   Certificate Approved At: ${e.certificateApprovedAt || 'N/A'}`);
      console.log('');
    });

    // Check completed courses
    const completed = enrollments.filter(e => e.completed);
    console.log(`✅ Completed courses: ${completed.length}`);
    
    const withCertStatus = enrollments.filter(e => e.certificateStatus);
    console.log(`📋 Enrollments with certificateStatus: ${withCertStatus.length}`);

    const pending = enrollments.filter(e => e.certificateStatus === 'pending');
    console.log(`🟡 Pending certificates: ${pending.length}`);

    const approved = enrollments.filter(e => e.certificateStatus === 'approved');
    console.log(`🟢 Approved certificates: ${approved.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testUserCertificates();
