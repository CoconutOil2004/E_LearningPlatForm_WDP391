/**
 * MIGRATION SCRIPT: Cập nhật certificateStatus cho enrollments cũ
 * 
 * Chạy script này SAU KHI deploy code mới để:
 * 1. Set certificateStatus = "approved" cho enrollments đã completed (backward compatibility)
 * 2. Set certificateStatus = "not_eligible" cho enrollments chưa completed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Enrollment = require('../src/models/Enrollment');

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'E_Learning',
    });
    console.log('✅ Connected to MongoDB\n');

    // 1. Đếm số lượng enrollments cần migrate
    const needMigration = await Enrollment.countDocuments({
      certificateStatus: { $exists: false }
    });

    console.log(`📊 Found ${needMigration} enrollments without certificateStatus field\n`);

    if (needMigration === 0) {
      console.log('✅ No enrollments need migration. All done!');
      return;
    }

    // 2. Migrate completed enrollments → "approved" (để user không bị mất certificate)
    console.log('🔄 Migrating completed enrollments to "approved"...');
    const result1 = await Enrollment.updateMany(
      { 
        completed: true, 
        certificateStatus: { $exists: false } 
      },
      { 
        $set: { 
          certificateStatus: "approved",
          certificateApprovedAt: new Date()
        } 
      }
    );
    console.log(`✅ Updated ${result1.modifiedCount} completed enrollments to "approved"`);

    // 3. Migrate incomplete enrollments → "not_eligible"
    console.log('🔄 Migrating incomplete enrollments to "not_eligible"...');
    const result2 = await Enrollment.updateMany(
      { 
        completed: { $ne: true },
        certificateStatus: { $exists: false } 
      },
      { 
        $set: { certificateStatus: "not_eligible" } 
      }
    );
    console.log(`✅ Updated ${result2.modifiedCount} incomplete enrollments to "not_eligible"\n`);

    // 4. Verify migration
    console.log('🔍 Verifying migration...');
    const stats = await Enrollment.aggregate([
      {
        $group: {
          _id: "$certificateStatus",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Certificate Status Distribution:');
    stats.forEach(stat => {
      console.log(`   - ${stat._id || "null"}: ${stat.count}`);
    });

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run migration
migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
