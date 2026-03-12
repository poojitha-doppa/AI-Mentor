import express from 'express';
import mongoose from 'mongoose';
import UserEnrollment from '../models/UserEnrollment.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Roadmap from '../models/Roadmap.js';
import SkillEvaluation from '../models/SkillEvaluation.js';

const router = express.Router();

// Enroll in a course
router.post('/enroll/course', async (req, res) => {
  try {
    const { userId, userEmail, courseId, courseTitle, courseModules } = req.body;

    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'User ID or email required' });
    }

    // Check if already enrolled
    const existing = await UserEnrollment.findOne({
      $or: [{ userId }, { userEmail }],
      courseTitle,
      type: 'course'
    });

    if (existing) {
      return res.json({ 
        success: true, 
        message: 'Already enrolled', 
        enrollment: existing 
      });
    }

    const enrollment = await UserEnrollment.create({
      userId,
      userEmail,
      courseId,
      courseTitle,
      courseModules,
      courseProgress: 0,
      type: 'course'
    });

    res.json({ 
      success: true, 
      message: 'Course enrolled successfully', 
      enrollment 
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enroll in a roadmap
router.post('/enroll/roadmap', async (req, res) => {
  try {
    const { userId, userEmail, roadmapId, roadmapTitle, roadmapStages } = req.body;

    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'User ID or email required' });
    }

    const existing = await UserEnrollment.findOne({
      $or: [{ userId }, { userEmail }],
      roadmapTitle,
      type: 'roadmap'
    });

    if (existing) {
      return res.json({ 
        success: true, 
        message: 'Already enrolled', 
        enrollment: existing 
      });
    }

    const enrollment = await UserEnrollment.create({
      userId,
      userEmail,
      roadmapId,
      roadmapTitle,
      roadmapStages,
      roadmapCreatedAt: new Date(),
      type: 'roadmap'
    });

    res.json({ 
      success: true, 
      message: 'Roadmap saved successfully', 
      enrollment 
    });
  } catch (error) {
    console.error('Roadmap enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile with all enrollments
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('Fetching profile for userId:', userId);

    // Determine if userId is an ObjectId or string identifier
    let userQuery = {};
    let isObjectId = mongoose.Types.ObjectId.isValid(userId) && userId !== 'guest';
    
    if (isObjectId) {
      userQuery = { _id: userId };
    } else if (userId.includes('@')) {
      userQuery = { email: userId };
    } else {
      userQuery = { _id: userId }; // Try as ObjectId anyway
    }

    // Try to get user info
    let user = null;
    try {
      user = await User.findOne(userQuery);
    } catch (err) {
      console.log('User not found in User collection:', err.message);
    }

    // Build query for finding user's data
    let dataQuery = {};
    if (isObjectId && user) {
      dataQuery = { $or: [{ user: userId }, { userId: userId }, { userEmail: user.email }] };
    } else if (userId.includes('@')) {
      dataQuery = { $or: [{ userEmail: userId }, { userId: userId }] };
    } else {
      dataQuery = { $or: [{ userId: userId }, { userEmail: userId }] };
    }

    console.log('Data query:', JSON.stringify(dataQuery));

    // Get data from actual collections (not just enrollments)
    const [courses, roadmaps, evaluations, enrollmentCourses, enrollmentRoadmaps, enrollmentEvaluations] = await Promise.all([
      Course.find(dataQuery).sort({ createdAt: -1 }).lean(),
      Roadmap.find(dataQuery).sort({ createdAt: -1 }).lean(),
      SkillEvaluation.find(dataQuery).sort({ createdAt: -1 }).lean(),
      UserEnrollment.find({ ...dataQuery, type: 'course' }).sort({ createdAt: -1 }).lean(),
      UserEnrollment.find({ ...dataQuery, type: 'roadmap' }).sort({ createdAt: -1 }).lean(),
      UserEnrollment.find({ ...dataQuery, type: 'evaluation' }).sort({ createdAt: -1 }).lean()
    ]);

    console.log('Found:', { 
      courses: courses.length, 
      roadmaps: roadmaps.length, 
      evaluations: evaluations.length,
      enrollmentCourses: enrollmentCourses.length,
      enrollmentRoadmaps: enrollmentRoadmaps.length,
      enrollmentEvaluations: enrollmentEvaluations.length
    });

    // Combine enrollment data with actual data
    const allCourses = [...courses, ...enrollmentCourses.map(e => ({
      _id: e.courseId || e._id,
      title: e.courseTitle,
      modules: e.courseModules,
      progress: e.courseProgress,
      enrolledAt: e.courseEnrolledAt,
      completed: e.courseCompleted,
      source: 'enrollment'
    }))];

    const allRoadmaps = [...roadmaps, ...enrollmentRoadmaps.map(e => ({
      _id: e.roadmapId || e._id,
      title: e.roadmapTitle,
      stages: e.roadmapStages,
      progress: e.roadmapProgress,
      createdAt: e.roadmapCreatedAt,
      source: 'enrollment'
    }))];

    const allEvaluations = [...evaluations, ...enrollmentEvaluations.map(e => ({
      _id: e.evaluationId || e._id,
      title: e.evaluationTitle,
      skillName: e.evaluationTitle,
      score: e.evaluationScore,
      completedAt: e.evaluationCompletedAt,
      source: 'enrollment'
    }))];

    // Remove duplicates
    const uniqueCourses = Array.from(new Map(allCourses.map(c => [c._id?.toString() || c.title, c])).values());
    const uniqueRoadmaps = Array.from(new Map(allRoadmaps.map(r => [r._id?.toString() || r.title, r])).values());
    const uniqueEvaluations = Array.from(new Map(allEvaluations.map(e => [e._id?.toString() || e.title, e])).values());

    res.json({
      success: true,
      profile: {
        userId,
        name: user?.name || 'User',
        email: user?.email || userId,
        stats: {
          totalCourses: uniqueCourses.length,
          totalRoadmaps: uniqueRoadmaps.length,
          totalEvaluations: uniqueEvaluations.length,
          activeDays: user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
        },
        courses: uniqueCourses.map(c => ({
          id: c._id,
          title: c.title,
          description: c.description,
          level: c.level || c.difficulty,
          duration: c.duration,
          modules: c.modules || c.totalModules,
          totalModules: c.totalModules || (Array.isArray(c.modules) ? c.modules.length : 0),
          progress: c.progress || 0,
          enrolledAt: c.enrolledAt || c.createdAt,
          lastAccessed: c.lastAccessedAt || c.lastAccessed,
          completed: c.completed || c.status === 'completed',
          status: c.status
        })),
        roadmaps: uniqueRoadmaps.map(r => ({
          id: r._id,
          title: r.title,
          description: r.description,
          currentRole: r.currentRole,
          targetRole: r.targetRole,
          timeline: r.timeline,
          stages: r.stages || 0,
          progress: r.progress || 0,
          createdAt: r.createdAt,
          status: r.status
        })),
        evaluations: uniqueEvaluations.map(e => ({
          id: e._id,
          title: e.title || e.skillName,
          skillName: e.skillName,
          difficulty: e.difficulty,
          score: e.score,
          percentage: e.percentage,
          totalQuestions: e.totalQuestions,
          correctAnswers: e.correctAnswers,
          completedAt: e.completedAt,
          status: e.status
        }))
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update course progress
router.put('/progress/course/:enrollmentId', async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress, completed, completedModules } = req.body;

    const enrollment = await UserEnrollment.findByIdAndUpdate(
      enrollmentId,
      {
        courseProgress: progress,
        courseCompleted: completed,
        courseLastAccessed: new Date(),
        'metadata.completedModules': completedModules
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update roadmap progress
router.put('/progress/roadmap/:enrollmentId', async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress, completedStages } = req.body;

    const enrollment = await UserEnrollment.findByIdAndUpdate(
      enrollmentId,
      {
        roadmapProgress: progress,
        'metadata.completedStages': completedStages,
        'metadata.lastUpdated': new Date()
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    console.error('Roadmap progress update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit skill evaluation/test
router.post('/evaluation/submit', async (req, res) => {
  try {
    const { userId, userEmail, evaluationTitle, score, totalQuestions, correctAnswers, timeTaken } = req.body;

    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'User ID or email required' });
    }

    const enrollment = await UserEnrollment.create({
      userId,
      userEmail,
      evaluationTitle,
      evaluationScore: score,
      evaluationCompletedAt: new Date(),
      type: 'evaluation',
      metadata: {
        totalQuestions,
        correctAnswers,
        timeTaken
      }
    });

    res.json({ 
      success: true, 
      message: 'Evaluation submitted successfully', 
      enrollment 
    });
  } catch (error) {
    console.error('Evaluation submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
