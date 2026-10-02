import { Router } from 'express';
import crypto from 'crypto';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Question from '../models/Question.js';
import Assessment from '../models/Assessment.js';
const router = Router();
const adminSessions = new Map();

const sanitizeAdmin = (admin) => ({
  _id: admin._id,
  name: admin.name,
  email: admin.email,
});

const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : '';
  const adminId = adminSessions.get(token);
  if (!adminId) return res.status(401).json({ error: 'Admin authentication required' });
  req.adminId = adminId;
  next();
};

const sanitizeStudent = (student) => {
  if (!student) return student;
  const plain = student.toObject ? student.toObject() : student;
  delete plain.password;
  delete plain.passwordSalt;
  return plain;
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin || admin.name !== name.trim() || !admin.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, admin._id.toString());
    res.json({ success: true, token, admin: sanitizeAdmin(admin) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.use(requireAdmin);

router.post('/admins', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!name?.trim() || !normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Name, email, password, and confirm password are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password must match.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (await Admin.exists({ email: normalizedEmail })) {
      return res.status(409).json({ error: 'This admin email is already registered.' });
    }
    const passwordSalt = crypto.randomBytes(16).toString('hex');
    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordSalt,
      password: Admin.hashPassword(password, passwordSalt),
    });
    res.status(201).json({ admin: sanitizeAdmin(admin) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'This admin email is already registered.' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const completed = await Student.countDocuments({ assessmentStatus: 'completed' });
    const inProgress = await Student.countDocuments({ assessmentStatus: 'in_progress' });
    const notAttempted = await Student.countDocuments({ assessmentStatus: { $in: ['not_started', 'details_verified', 'rules_accepted'] } });
    const failed = await Student.countDocuments({ assessmentStatus: 'failed' });

    // Skill-wise count
    const skillCounts = await Student.aggregate([
      { $match: { selectedSkill: { $exists: true, $ne: null } } },
      { $group: { _id: '$selectedSkill', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Score statistics from completed assessments
    const scoreStats = await Assessment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalScore' },
          highestScore: { $max: '$totalScore' },
          lowestScore: { $min: '$totalScore' },
          avgTime: { $avg: '$timeUsed' },
        }
      }
    ]);

    // Question-wise success rates
    const questionSuccessRates = await Assessment.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$questions' },
      {
        $group: {
          _id: '$questions.questionId',
          totalAttempts: { $sum: { $cond: [{ $eq: ['$questions.status', 'submitted'] }, 1, 0] } },
          correctAttempts: { $sum: { $cond: [{ $eq: ['$questions.result', 'correct'] }, 1, 0] } },
        }
      },
      { $addFields: { successRate: { $cond: [{ $gt: ['$totalAttempts', 0] }, { $divide: ['$correctAttempts', '$totalAttempts'] }, 0] } } },
      { $sort: { successRate: 1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalStudents,
      completed,
      inProgress,
      notAttempted,
      failed,
      skillCounts,
      scoreStats: scoreStats[0] || { avgScore: 0, highestScore: 0, lowestScore: 0, avgTime: 0 },
      questionSuccessRates
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const { search, year, section, skill, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (year) filter.year = year;
    if (section) filter.section = section;
    if (skill) filter.selectedSkill = skill;
    if (status) filter.assessmentStatus = status;

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .select('-password -passwordSalt')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ students: students.map(sanitizeStudent), total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a student
router.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    await Assessment.deleteMany({ studentId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student journey
router.get('/students/:id/journey', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password -passwordSalt');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const assessment = await Assessment.findOne({ studentId: student._id }).populate('questions.questionId');

    res.json({ student: sanitizeStudent(student), assessment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Rankings
router.get('/rankings', async (req, res) => {
  try {
    const { year, section, skill, limit = 50 } = req.query;
    const filter = { status: 'completed' };

    const pipeline = [
      { $match: filter },
      { $sort: { totalScore: -1, timeUsed: 1 } },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
    ];

    if (year) pipeline.push({ $match: { 'student.year': year } });
    if (section) pipeline.push({ $match: { 'student.section': section } });
    if (skill) pipeline.push({ $match: { skill } });

    pipeline.push({ $limit: parseInt(limit) });

    const rankings = await Assessment.aggregate(pipeline);

    res.json({ rankings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Question management
router.get('/questions', async (req, res) => {
  try {
    const { skill, difficulty, concept, search } = req.query;
    const filter = {};
    if (skill) filter.skill = skill;
    if (difficulty) filter.difficulty = difficulty;
    if (concept) filter.concept = { $regex: concept, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const questions = await Question.find(filter).sort({ skill: 1, difficulty: 1 });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Export students as JSON (CSV conversion done client-side or using json2csv)
router.get('/students/export', async (req, res) => {
  try {
    const students = await Student.find().lean();
    const assessments = await Assessment.find({ status: 'completed' }).lean();

    const data = students.map(s => {
      const a = assessments.find(a => a.studentId.toString() === s._id.toString());
      return {
        name: s.name,
        rollNumber: s.rollNumber,
        registrationNumber: s.registrationNumber,
        department: s.department,
        year: s.year,
        section: s.section,
        phone: s.phone || '',
        email: s.email || '',
        selectedSkill: s.selectedSkill || '',
        assessmentStatus: s.assessmentStatus,
        score: a?.totalScore || 0,
        attempted: a?.questionsAttempted || 0,
        correct: a?.questionsCorrect || 0,
        wrong: a?.questionsWrong || 0,
        skipped: a?.questionsSkipped || 0,
      };
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// Reseed question bank only
router.post('/reseed', async (req, res) => {
  try {
    const { seedQuestions } = await import('../seed.js');
    await seedQuestions();
    res.json({ success: true, message: 'Question bank reseeded successfully.' });
  } catch (err) {
    console.error('Reseed error:', err);
    res.status(500).json({ error: 'Reseed failed: ' + err.message });
  }
});

export default router;
