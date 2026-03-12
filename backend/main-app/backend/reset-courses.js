// Reset database by deleting courses created as 'guest'
import mongoose from 'mongoose';
import Course from './models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

async function resetCourses() {
  try {
    console.log('\n=== RESETTING DATABASE - DELETING GUEST COURSES ===\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerOs');
    console.log('✅ Connected to MongoDB\n');

    // Find all courses created as 'guest'
    const guestCourses = await Course.find({ userId: 'guest' });
    console.log(`Found ${guestCourses.length} courses with userId: 'guest'`);
    guestCourses.forEach((course, idx) => {
      console.log(`  ${idx + 1}. ${course.title} (created: ${course.createdAt})`);
    });

    if (guestCourses.length > 0) {
      // Delete them
      const result = await Course.deleteMany({ userId: 'guest' });
      console.log(`\n✅ Deleted ${result.deletedCount} guest courses\n`);
    }

    // Show remaining courses
    const remaining = await Course.find().select('_id title userId userEmail');
    console.log(`📚 Remaining courses in database: ${remaining.length}`);
    remaining.forEach((course, idx) => {
      console.log(`  ${idx + 1}. ${course.title}`);
      console.log(`     - userId: ${course.userId}`);
      console.log(`     - userEmail: ${course.userEmail}`);
    });

    console.log('\n✅ DATABASE RESET COMPLETE\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetCourses();
