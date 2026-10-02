import { Router } from 'express';
import Question from '../models/Question.js';

const router = Router();

// Get 20 questions for a skill (randomized selection)
router.get('/:skill', async (req, res) => {
  try {
    const { skill } = req.params;

    // Get all active questions for this skill
    const allQuestions = await Question.find({ skill, isActive: true });

    if (allQuestions.length === 0) {
      return res.status(404).json({ error: 'No questions found for this skill' });
    }

    // The skill filter is the category boundary. Do not mix question banks.
    const selected = allQuestions
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, skill === 'Web Development' ? 1 : 20);

    // Don't send hidden test cases to client
    const safeQuestions = selected.map(q => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      skill: q.skill,
      concept: q.concept,
      difficulty: q.difficulty,
      inputFormat: q.inputFormat,
      outputFormat: q.outputFormat,
      sampleInput: q.sampleInput,
      sampleOutput: q.sampleOutput,
      marks: q.marks,
      boilerplateCode: q.boilerplateCode,
    }));

    res.json({ questions: safeQuestions });
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
