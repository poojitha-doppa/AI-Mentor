// Check user email in database and course linkage
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import UserEnrollment from './models/UserEnrollment.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUserEmail() {
  try {
    console.log('\n=== CHECKING DATABASE FOR USER AND COURSE DATA ===\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerOs');
    console.log('✅ Connected to MongoDB\n');

    // 1. Get all users
    console.log('📋 USERS IN DATABASE:');
    const users = await User.find().select('_id email name').lean();
    console.log(`Found ${users.length} users:`);
    users.forEach((user, idx) => {
      console.log(`  ${idx + 1}. Email: ${user.email}, ID: ${user._id}, Name: ${user.name}`);
    });

    // 2. Get all courses
    console.log('\n📚 COURSES IN DATABASE:');
    const courses = await Course.find().select('_id title user userId userEmail createdAt').lean();
    console.log(`Found ${courses.length} courses:`);
    courses.forEach((course, idx) => {
      console.log(`  ${idx + 1}. Title: ${course.title}`);
      console.log(`     - user (ObjectId): ${course.user}`);
      console.log(`     - userId (String): ${course.userId}`);
      console.log(`     - userEmail: ${course.userEmail}`);
      console.log(`     - Created: ${course.createdAt}`);
    });

    // 3. Get enrollments
    console.log('\n📝 ENROLLMENTS IN DATABASE:');
    const enrollments = await UserEnrollment.find().select('_id userId userEmail courseId courseTitle type createdAt').lean();
    console.log(`Found ${enrollments.length} enrollments:`);
    enrollments.forEach((enrollment, idx) => {
      console.log(`  ${idx + 1}. Type: ${enrollment.type}, CourseTitle: ${enrollment.courseTitle}`);
      console.log(`     - userId: ${enrollment.userId}`);
      console.log(`     - userEmail: ${enrollment.userEmail}`);
      console.log(`     - Created: ${enrollment.createdAt}`);
    });

    // 4. Check if first user has any courses
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n🔍 CHECKING COURSES FOR USER: ${firstUser.email}`);
      
      const userCourses = await Course.find({
        $or: [
          { user: firstUser._id },
          { userId: firstUser._id.toString() },
          { userEmail: firstUser.email }
        ]
      }).select('_id title userEmail').lean();
      
      console.log(`Found ${userCourses.length} courses linked to this user`);
      userCourses.forEach((course, idx) => {
        console.log(`  ${idx + 1}. ${course.title} (userEmail: ${course.userEmail})`);
      });
    }

    // 5. Example query that profile endpoint would use
    if (users.length > 0) {
      const firstUser = users[0];
      const userId = firstUser._id.toString();
      
      console.log(`\n📊 PROFILE QUERY FOR USER ${firstUser.email}:`);
      console.log(`Query: { $or: [{ user: "${userId}" }, { userId: "${userId}" }, { userEmail: "${firstUser.email}" }] }`);
      
      const profileCourses = await Course.find({
        $or: [
          { user: userId },
          { userId: userId },
          { userEmail: firstUser.email }
        ]
      }).select('_id title user userId userEmail').lean();
      
      console.log(`Would return ${profileCourses.length} courses`);
      profileCourses.forEach((course, idx) => {
        console.log(`  ${idx + 1}. ${course.title}`);
      });
    }

    console.log('\n✅ CHECK COMPLETE');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserEmail();
