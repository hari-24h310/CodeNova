import { Router } from 'express';
import Assessment from '../models/Assessment.js';
import Student from '../models/Student.js';
import Question from '../models/Question.js';

const router = Router();

// Start a new assessment
router.post('/start', async (req, res) => {
  try {
    const { studentId, skill } = req.body;
    if (!studentId || !skill) {
      return res.status(400).json({ error: 'studentId and skill are required' });
    }

    // Check for existing active assessment
    const existing = await Assessment.findOne({ studentId, status: { $in: ['in_progress', 'not_started'] } });
    if (existing) {
      return res.json({ assessment: existing });
    }

    const bankQuestions = await Question.find({ skill, isActive: true })
      .sort({ title: 1 })
      .limit(skill === 'Web Development' ? 1 : 20)
      .select('_id');
    if (!bankQuestions.length) {
      return res.status(400).json({ error: 'No active questions found for this skill' });
    }

    // Build responses from the server-owned skill bank, never client IDs.
    const questions = bankQuestions.map((question, i) => ({
      questionId: question._id,
      questionIndex: i,
      code: '',
      status: 'not_attempted',
      result: 'pending',
    }));

    const assessment = await Assessment.create({
      studentId,
      skill,
      questions,
      status: 'not_started',
    });

    // Update student
    await Student.findByIdAndUpdate(studentId, {
      assessmentId: assessment._id,
      selectedSkill: skill,
      assessmentStatus: 'skill_selected',
      skillSelectedAt: new Date()
    });

    res.json({ assessment });
  } catch (err) {
    console.error('Start assessment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assessment by ID
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    res.json({ assessment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Save progress (autosave)
router.put('/:id/save', async (req, res) => {
  try {
    const { currentQuestion, code, timeUsed, timerStarted, questions } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    if (assessment.status === 'completed') {
      return res.status(400).json({ error: 'Assessment already submitted' });
    }

    // Update timer state
    if (timerStarted && !assessment.timerStarted) {
      assessment.timerStarted = true;
      assessment.startedAt = new Date();
      assessment.status = 'in_progress';

      await Student.findByIdAndUpdate(assessment.studentId, {
        assessmentStatus: 'in_progress',
        testStartedAt: new Date()
      });
    }

    if (timeUsed !== undefined) assessment.timeUsed = timeUsed;

    // Update question code if provided
    if (currentQuestion !== undefined && code !== undefined && assessment.questions[currentQuestion]) {
      assessment.questions[currentQuestion].code = code;
      if (code.trim() && assessment.questions[currentQuestion].status === 'not_attempted') {
        assessment.questions[currentQuestion].status = 'in_progress';
      }
    }

    // Bulk update questions if provided
    if (questions && Array.isArray(questions)) {
      questions.forEach(q => {
        if (assessment.questions[q.index]) {
          if (q.code !== undefined) assessment.questions[q.index].code = q.code;
          if (q.output !== undefined) assessment.questions[q.index].output = q.output;
          if (q.attempts !== undefined) assessment.questions[q.index].attempts = q.attempts;
          if (q.status === 'skipped' && !assessment.questions[q.index].code?.trim()) {
            assessment.questions[q.index].status = 'skipped';
            assessment.questions[q.index].result = 'skipped';
          }
        }
      });
    }

    assessment.markModified('questions');
    await assessment.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Save progress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit assessment (final)
router.post('/:id/submit', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    if (assessment.status === 'completed') {
      return res.status(400).json({ error: 'Already submitted' });
    }

    // STRICT SCORE CALCULATION:
    // Solved count must ONLY include questions that are verified 'correct' / 'passed'
    let totalScore = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let attempted = 0;

    for (const q of assessment.questions) {
      const hasCode = q.code && q.code.trim().length > 0;

      if (q.status === 'submitted' || q.status === 'passed') {
        if (hasCode && (q.result === 'correct' || q.result === 'passed')) {
          correct++;
          totalScore += 5; // 5 marks per passed question
          attempted++;
        } else if (hasCode) {
          wrong++;
          attempted++;
        } else {
          // Empty code marked as skipped
          q.status = 'skipped';
          q.result = 'pending';
          skipped++;
        }
      } else if (q.status === 'skipped') {
        skipped++;
      } else {
        // Not attempted
        skipped++;
      }
    }

    assessment.totalScore = Math.min(100, totalScore);
    assessment.questionsAttempted = attempted;
    assessment.questionsCorrect = correct;
    assessment.questionsWrong = wrong;
    assessment.questionsSkipped = skipped;
    assessment.completedAt = new Date();
    assessment.status = 'completed';

    assessment.markModified('questions');
    await assessment.save();

    // Update student
    await Student.findByIdAndUpdate(assessment.studentId, {
      assessmentStatus: 'completed',
      testCompletedAt: new Date()
    });

    res.json({
      totalScore: assessment.totalScore,
      questionsAttempted: attempted,
      questionsCorrect: correct,
      questionsWrong: wrong,
      questionsSkipped: skipped,
      timeUsed: assessment.timeUsed,
      skill: assessment.skill
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark tab switch
router.post('/:id/tab-switch', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    assessment.tabSwitchDetected = true;
    assessment.status = 'failed';
    await assessment.save();

    const student = await Student.findById(assessment.studentId);
    if (student) {
      student.assessmentStatus = 'failed';
      student.tabSwitchDetected = true;
      student.tabSwitchCount = (student.tabSwitchCount || 0) + 1;
      await student.save();
    }

    res.json({ failed: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
