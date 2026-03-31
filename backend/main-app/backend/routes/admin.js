import express from 'express';
import User from '../models/User.js';
import CourseGeneration from '../models/CourseGeneration.js';
import Course from '../models/Course.js';
import Roadmap from '../models/Roadmap.js';
import SkillEvaluation from '../models/SkillEvaluation.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

function toInt(value, fallback) {
  const num = Number.parseInt(value, 10);
  return Number.isNaN(num) ? fallback : num;
}

function normalizeUserRef(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value._id) {
    return String(value._id);
  }
  return null;
}

async function attachGeneratedBy(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  const idSet = new Set();
  const emailSet = new Set();

  records.forEach((record) => {
    const userRef = normalizeUserRef(record.user);
    if (userRef) {
      idSet.add(userRef);
    }

    if (record.userId && record.userId !== 'guest' && record.userId !== 'null') {
      idSet.add(String(record.userId));
    }

    if (record.userEmail) {
      emailSet.add(String(record.userEmail).toLowerCase());
    }
  });

  const query = [];
  if (idSet.size > 0) {
    query.push({ _id: { $in: Array.from(idSet) } });
  }
  if (emailSet.size > 0) {
    query.push({ email: { $in: Array.from(emailSet) } });
  }

  const users = query.length > 0
    ? await User.find({ $or: query }).select('name email').lean()
    : [];

  const userById = new Map(users.map((user) => [String(user._id), user]));
  const userByEmail = new Map(users.map((user) => [String(user.email).toLowerCase(), user]));

  return records.map((record) => {
    const refId = normalizeUserRef(record.user);
    const idCandidate = refId || (record.userId && record.userId !== 'guest' ? String(record.userId) : null);
    const emailCandidate = record.userEmail ? String(record.userEmail).toLowerCase() : null;

    const user =
      (idCandidate && userById.get(idCandidate)) ||
      (emailCandidate && userByEmail.get(emailCandidate)) ||
      (record.user && typeof record.user === 'object' ? record.user : null);

    const generatedBy =
      user?.name ||
      user?.email ||
      record.userEmail ||
      ((record.userId && record.userId !== 'guest') ? String(record.userId) : 'Guest');

    return {
      ...record,
      generatedBy,
      generatedByEmail: user?.email || record.userEmail || null
    };
  });
}

router.get('/users', async (req, res) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 20), 1), 200);
    const skip = (page - 1) * limit;

    const [totalUsers, users] = await Promise.all([
      User.countDocuments({}),
      User.find({})
        .select('name email role status createdAt lastLoginAt loginCount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    res.json({
      success: true,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      },
      users
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/module-data', async (req, res) => {
  try {
    const limit = Math.min(Math.max(toInt(req.query.limit, 20), 1), 100);

    const [coursesRaw, generatedCourses, roadmapsRaw, evaluationsRaw] = await Promise.all([
      Course.find({})
        .select('title level duration status progress user userId userEmail createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      CourseGeneration.find({})
        .select('courseName level duration status user createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Roadmap.find({})
        .select('title currentRole targetRole timeline status progress user userId userEmail createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      SkillEvaluation.find({})
        .select('title skillName difficulty score percentage status user userId userEmail completedAt createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    ]);

    const [courses, roadmaps, evaluations] = await Promise.all([
      attachGeneratedBy(coursesRaw),
      attachGeneratedBy(roadmapsRaw),
      attachGeneratedBy(evaluationsRaw)
    ]);

    res.json({
      success: true,
      modules: {
        courses,
        generatedCourses,
        roadmaps,
        evaluations
      }
    });
  } catch (error) {
    console.error('Admin module data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch module data' });
  }
});

router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalAdmins,
      activeUsersLast7Days,
      totalCourses,
      totalGeneratedCourses,
      totalRoadmaps,
      totalEvaluations,
      avgEvaluationScore,
      latestUsers,
      latestCourses,
      latestRoadmaps,
      latestEvaluations
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ lastLoginAt: { $gte: sevenDaysAgo } }),
      Course.countDocuments({}),
      CourseGeneration.countDocuments({}),
      Roadmap.countDocuments({}),
      SkillEvaluation.countDocuments({}),
      SkillEvaluation.aggregate([
        { $match: { score: { $type: 'number' } } },
        { $group: { _id: null, averageScore: { $avg: '$score' } } }
      ]),
      User.find({})
        .select('name email role status createdAt lastLoginAt loginCount')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Course.find({})
        .select('title level duration status progress user userId userEmail createdAt')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Roadmap.find({})
        .select('title currentRole targetRole timeline status progress user userId userEmail createdAt')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      SkillEvaluation.find({})
        .select('title skillName difficulty score percentage status user userId userEmail completedAt createdAt')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
    ]);

    const [latestCoursesEnriched, latestRoadmapsEnriched, latestEvaluationsEnriched] = await Promise.all([
      attachGeneratedBy(latestCourses),
      attachGeneratedBy(latestRoadmaps),
      attachGeneratedBy(latestEvaluations)
    ]);

    const analytics = {
      totalUsers,
      totalAdmins,
      activeUsersLast7Days,
      totalCourses,
      totalGeneratedCourses,
      totalRoadmaps,
      totalEvaluations,
      averageEvaluationScore: Number((avgEvaluationScore[0]?.averageScore || 0).toFixed(2))
    };

    res.json({
      success: true,
      analytics,
      users: latestUsers,
      modules: {
        courses: latestCoursesEnriched,
        roadmaps: latestRoadmapsEnriched,
        evaluations: latestEvaluationsEnriched
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

export default router;
