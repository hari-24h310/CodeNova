import { Router } from 'express';
import crypto from 'crypto';
import Student from '../models/Student.js';

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeStudent = (student) => {
  if (!student) return student;
  const plain = student.toObject ? student.toObject() : student;
  delete plain.password;
  delete plain.passwordSalt;
  return plain;
};

const sanitizeStudentPayload = (payload = {}) => ({
  name: String(payload.name || '').trim(),
  rollNumber: String(payload.rollNumber || '').trim().toUpperCase(),
  registrationNumber: String(payload.registrationNumber || '').trim().toUpperCase(),
  department: String(payload.department || 'BCA').trim(),
  year: String(payload.class || payload.year || '').trim(),
  section: String(payload.section || '').trim().toUpperCase(),
  phone: String(payload.phone || '').trim(),
  email: String(payload.email || '').trim().toLowerCase(),
  password: String(payload.password || '').trim(),
});

router.post('/register', async (req, res) => {
  try {
    const payload = sanitizeStudentPayload(req.body);
    const requiredFields = ['name', 'rollNumber', 'registrationNumber', 'year', 'section', 'department', 'phone', 'email', 'password'];

    const missing = requiredFields.filter(field => !payload[field]);
    if (missing.length) {
      return res.status(400).json({ error: 'All student registration fields are required.' });
    }
    if (!req.body.confirmPassword || req.body.confirmPassword !== payload.password) {
      return res.status(400).json({ error: 'Password and confirm password must match.' });
    }
    if (!emailRegex.test(payload.email)) {
      return res.status(400).json({ error: 'Please enter a valid personal email address.' });
    }
    if (payload.password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const duplicate = await Student.findOne({
      $or: [
        { rollNumber: payload.rollNumber },
        { registrationNumber: payload.registrationNumber },
        { email: payload.email }
      ]
    }).select('-password -passwordSalt');

    if (duplicate) {
      if (duplicate.rollNumber === payload.rollNumber) {
        return res.status(409).json({ error: 'This roll number is already registered.' });
      }
      if (duplicate.registrationNumber === payload.registrationNumber) {
        return res.status(409).json({ error: 'This register number is already registered.' });
      }
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const student = await Student.create({
      ...payload,
      passwordSalt: salt,
      password: Student.hashPassword(payload.password, salt),
      assessmentStatus: 'not_started',
    });

    res.status(201).json({ student: sanitizeStudent(student), success: true });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A student with the same roll number, register number, or email already exists.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { rollNumber, email, password } = req.body;
    const identifier = (rollNumber || email || '').trim();
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Roll number/email and password are required.' });
    }

    const student = await Student.findOne({
      $or: [
        { rollNumber: identifier.toUpperCase() },
        { email: String(identifier).toLowerCase() }
      ]
    }).select('+password +passwordSalt');

    if (!student) {
      return res.status(404).json({ error: 'Student not found. Please register first.' });
    }

    const isValid = student.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }

    if (student.assessmentStatus === 'completed') {
      return res.status(400).json({ error: 'You have already completed the assessment.' });
    }

    student.loginTime = new Date();
    await student.save();

    res.json({ student: sanitizeStudent(student) });
  } catch (err) {
    console.error('Student login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify student by roll number (legacy route maintained for existing flow and compatibility)
router.post('/verify', async (req, res) => {
  try {
    const { rollNumber } = req.body;
    if (!rollNumber) return res.status(400).json({ error: 'Roll number is required' });

    const student = await Student.findOne({ rollNumber: rollNumber.trim().toUpperCase() });
    if (!student) return res.status(404).json({ error: 'Student not found. Please check your roll number.' });

    if (student.assessmentStatus === 'completed') {
      return res.status(400).json({ error: 'You have already completed the assessment.' });
    }

    student.loginTime = new Date();
    await student.save();

    res.json({ student: sanitizeStudent(student) });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update student details
router.put('/:id', async (req, res) => {
  try {
    const { name, rollNumber, registrationNumber, department, year, section, phone, email } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name, rollNumber, registrationNumber, department, year, section, phone, email,
        assessmentStatus: 'details_verified',
        detailsVerifiedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ student: sanitizeStudent(student) });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
