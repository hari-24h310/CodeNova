import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import studentRoutes from './routes/students.js';
import questionRoutes from './routes/questions.js';
import assessmentRoutes from './routes/assessments.js';
import executionRoutes from './routes/execution.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';

import Student from './models/Student.js';
import Admin from './models/Admin.js';
import Question from './models/Question.js';
import Assessment from './models/Assessment.js';

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Auto seed helper
async function autoSeedDatabase() {
  try {
    const programmingSkills = ['Python', 'Java', 'C++', 'C', 'JavaScript', 'DSA', 'PHP', 'C#'];
    const programmingCounts = await Promise.all(
      programmingSkills.map((skill) => Question.countDocuments({ skill, isActive: true }))
    );
    const [sqlCount, webCount] = await Promise.all([
      Question.countDocuments({ skill: 'SQL', isActive: true }),
      Question.countDocuments({ skill: 'Web Development', isActive: true })
    ]);
    if (programmingCounts.every((count) => count >= 200) && sqlCount >= 20 && webCount >= 1) return;

    console.log('🌱 Refreshing question banks...');
    const { seedQuestions } = await import('./seed.js');
    await seedQuestions();
    console.log('✅ Question bank seeded successfully.');
  } catch (err) {
    throw new Error(`Question bank initialization failed: ${err.message}`);
  }
}

async function ensurePermanentAccounts() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, STUDENT_DEFAULT_PASSWORD } = process.env;

  if (ADMIN_NAME && ADMIN_EMAIL && ADMIN_PASSWORD) {
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const admin = await Admin.findOne({ email: ADMIN_EMAIL.trim().toLowerCase() });
    if (!admin) {
      await Admin.create({
        name: ADMIN_NAME.trim(),
        email: ADMIN_EMAIL.trim().toLowerCase(),
        passwordSalt: adminSalt,
        password: Admin.hashPassword(ADMIN_PASSWORD, adminSalt),
      });
    } else if (!admin.password || !admin.passwordSalt) {
      admin.passwordSalt = adminSalt;
      admin.password = Admin.hashPassword(ADMIN_PASSWORD, adminSalt);
      await admin.save();
    }
  } else {
    console.warn('Permanent admin account seeding skipped: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required.');
  }

  if (STUDENT_DEFAULT_PASSWORD && ADMIN_EMAIL) {
    const studentSalt = crypto.randomBytes(16).toString('hex');
    const student = await Student.findOne({ rollNumber: '24H310' });
    if (!student) {
      await Student.create({
        name: 'R Hariharan',
        rollNumber: '24H310',
        registrationNumber: '212402357',
        department: 'BCA',
        year: 'III BCA',
        section: 'D',
        phone: '9361972769',
        email: ADMIN_EMAIL.trim().toLowerCase(),
        passwordSalt: studentSalt,
        password: Student.hashPassword(STUDENT_DEFAULT_PASSWORD, studentSalt),
        assessmentStatus: 'not_started',
      });
    } else if (!student.password || !student.passwordSalt) {
      student.passwordSalt = studentSalt;
      student.password = Student.hashPassword(STUDENT_DEFAULT_PASSWORD, studentSalt);
      await student.save();
    }
  } else {
    console.warn('Permanent student account seeding skipped: STUDENT_DEFAULT_PASSWORD is required.');
  }
}

// Database Connection & Server Startup
async function startServer() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required. Configure a MongoDB Atlas connection string before starting CodeNova.');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, dbName: 'codenova' });
    console.log('✅ Connected to MongoDB database codenova.');
  } catch (mongoErr) {
    throw new Error(`MongoDB connection failed: ${mongoErr.message}`);
  }

  await ensurePermanentAccounts();
  await autoSeedDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CodeNova server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exitCode = 1;
});

export default app;
