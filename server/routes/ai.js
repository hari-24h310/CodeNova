import { Router } from 'express';
import Assessment from '../models/Assessment.js';
import Student from '../models/Student.js';
import Question from '../models/Question.js';

const router = Router();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null; // Return null if no API key
  }

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error('Gemini API error:', err);
    return null;
  }
}

// Individual student analysis
router.get('/student/:id/analysis', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const assessment = await Assessment.findOne({ studentId: student._id, status: 'completed' })
      .populate('questions.questionId');

    if (!assessment) {
      return res.status(404).json({ error: 'No completed assessment found' });
    }

    // Build context for AI
    const questionDetails = assessment.questions.map((q, i) => {
      const qData = q.questionId;
      return `Q${i + 1}: ${qData?.title || 'Unknown'} | Concept: ${qData?.concept || 'Unknown'} | Difficulty: ${qData?.difficulty || 'Unknown'} | Result: ${q.result} | Attempts: ${q.attempts || 1} | Time: ${q.timeSpent || 60}s`;
    }).join('\n');

    const prompt = `Analyze this student's coding assessment performance and provide actionable feedback.

Student: ${student.name}
Skill: ${assessment.skill}
Score: ${assessment.totalScore}/100
Questions Attempted: ${assessment.questionsAttempted}/20
Correct: ${assessment.questionsCorrect}
Wrong: ${assessment.questionsWrong}
Skipped: ${assessment.questionsSkipped}
Time Used: ${Math.round((assessment.timeUsed || 0) / 60)} minutes

Question Details:
${questionDetails}

Provide your analysis in this exact JSON format:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendedTraining": ["recommendation1", "recommendation2", "recommendation3", "recommendation4", "recommendation5"],
  "skillBreakdown": {"conceptName": percentageScore, ...},
  "overallLevel": "Beginner|Intermediate|Advanced",
  "summary": "Brief 2-3 sentence summary"
}

Base the skill breakdown on the actual concepts tested and results achieved. Return ONLY valid JSON.`;

    const aiResponse = await callGemini(prompt);
    
    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        if (analysis) {
          return res.json({ analysis });
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    }

    // High fidelity evidence-based fallback analysis
    const conceptResults = {};
    assessment.questions.forEach(q => {
      const concept = q.questionId?.concept || 'General Programming';
      if (!conceptResults[concept]) conceptResults[concept] = { correct: 0, total: 0 };
      conceptResults[concept].total++;
      if (q.result === 'correct') conceptResults[concept].correct++;
    });

    const skillBreakdown = {};
    const strengths = [];
    const weaknesses = [];
    Object.entries(conceptResults).forEach(([concept, data]) => {
      const pct = Math.round((data.correct / data.total) * 100);
      skillBreakdown[concept] = pct;
      if (pct >= 60) {
        strengths.push(`Good implementation of ${concept} (${pct}% success rate)`);
      } else {
        weaknesses.push(`Needs more practice with ${concept} (${pct}% score)`);
      }
    });

    if (strengths.length === 0) strengths.push('Demonstrated problem exploration and syntax awareness');
    if (weaknesses.length === 0) weaknesses.push('Can challenge advanced edge case optimization');

    const recommendedTraining = [
      ...weaknesses.map(w => w.replace('Needs more practice with ', 'Practice ')),
      'Focus on algorithmic time complexity and edge case handling',
      'Participate in timed mock assessments'
    ].slice(0, 5);

    const overallLevel = assessment.totalScore >= 75 ? 'Advanced' : assessment.totalScore >= 45 ? 'Intermediate' : 'Beginner';
    const summary = `${student.name} achieved ${assessment.totalScore}/100 in ${assessment.skill}. Demonstrated competence across ${strengths.length} core concepts, with high improvement opportunities in ${weaknesses.length ? weaknesses.map(w => w.split('(')[0].replace('Needs more practice with ', '')).join(', ') : 'complex algorithmic logic'}.`;

    res.json({
      analysis: {
        strengths,
        weaknesses,
        recommendedTraining,
        skillBreakdown,
        overallLevel,
        summary
      }
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Training plan
router.get('/student/:id/training-plan', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const assessment = await Assessment.findOne({ studentId: student._id, status: 'completed' })
      .populate('questions.questionId');

    if (!assessment) return res.status(404).json({ error: 'No completed assessment found' });

    const prompt = `Create a 4-week personalized training plan for this student.

Student: ${student.name}
Skill: ${assessment.skill}
Score: ${assessment.totalScore}/100
Correct: ${assessment.questionsCorrect}/20

Weak areas from assessment:
${assessment.questions.filter(q => q.result !== 'correct').map(q => q.questionId?.concept || 'Logic').join(', ')}

Return ONLY valid JSON:
{
  "currentLevel": "description",
  "weeks": [
    {"week": 1, "focus": "topic", "tasks": "description", "problemsPerDay": 5},
    {"week": 2, "focus": "topic", "tasks": "description", "problemsPerDay": 5},
    {"week": 3, "focus": "topic", "tasks": "description", "problemsPerDay": 5},
    {"week": 4, "focus": "topic", "tasks": "description", "problemsPerDay": 5}
  ]
}`;

    const aiResponse = await callGemini(prompt);
    
    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        if (plan) return res.json({ plan });
      } catch (e) { /* fallback */ }
    }

    // High fidelity fallback training plan
    const failedConcepts = [...new Set(assessment.questions.filter(q => q.result !== 'correct').map(q => q.questionId?.concept || 'Algorithms'))];
    const defaultTopics = ['Arrays & Subarrays', 'String Manipulation', 'Searching & Sorting', 'Problem Solving & Recursion'];
    const topics = failedConcepts.length >= 4 ? failedConcepts : [...failedConcepts, ...defaultTopics.filter(t => !failedConcepts.includes(t))].slice(0, 4);

    res.json({
      plan: {
        currentLevel: assessment.totalScore >= 75 ? 'Advanced Practical Foundation' : assessment.totalScore >= 45 ? 'Intermediate Competence' : 'Foundational Skill Builder',
        weeks: [
          {
            week: 1,
            focus: topics[0] || 'Arrays & Data Structures',
            tasks: `Solve 5 problems daily on ${topics[0] || 'Arrays'}, focusing on index manipulation and memory layout.`,
            problemsPerDay: 5
          },
          {
            week: 2,
            focus: topics[1] || 'Strings & Parsing',
            tasks: `Practice 5 problems per day on ${topics[1] || 'Strings'} including pattern searches and character frequencies.`,
            problemsPerDay: 5
          },
          {
            week: 3,
            focus: topics[2] || 'Searching & Sorting',
            tasks: `Implement binary search, custom sorting, and two-pointer techniques on 5 problems daily.`,
            problemsPerDay: 5
          },
          {
            week: 4,
            focus: topics[3] || 'Dynamic Problem Solving',
            tasks: `Tackle medium-level full problems, recursion, and edge-case validation with appropriate language features.`,
            problemsPerDay: 5
          }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Department-level analysis
router.get('/department/analysis', async (req, res) => {
  try {
    const skillCounts = await Student.aggregate([
      { $match: { selectedSkill: { $exists: true, $ne: null } } },
      { $group: { _id: '$selectedSkill', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const assessments = await Assessment.find({ status: 'completed' }).populate('questions.questionId');

    // Concept weakness aggregation
    const conceptFailures = {};
    assessments.forEach(a => {
      a.questions.forEach(q => {
        const concept = q.questionId?.concept || 'General';
        if (!conceptFailures[concept]) conceptFailures[concept] = { failed: 0, total: 0 };
        conceptFailures[concept].total++;
        if (q.result !== 'correct') conceptFailures[concept].failed++;
      });
    });

    const weakAreas = Object.entries(conceptFailures)
      .map(([concept, data]) => ({ concept, failRate: data.total > 0 ? data.failed / data.total : 0 }))
      .sort((a, b) => b.failRate - a.failRate)
      .slice(0, 10);

    const prompt = `Analyze this department's coding assessment data and provide recommendations.

Skill Distribution: ${JSON.stringify(skillCounts)}
Common Weak Areas: ${weakAreas.map(w => `${w.concept} (${Math.round(w.failRate * 100)}% failure rate)`).join(', ')}
Total Completed Assessments: ${assessments.length}

Return ONLY valid JSON:
{
  "summary": "2-3 sentence department overview",
  "commonWeakAreas": ["area1", "area2", "area3", "area4", "area5"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "workshopSuggestions": ["workshop1", "workshop2"]
}`;

    const aiResponse = await callGemini(prompt);
    
    let aiAnalysis = null;
    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (e) { /* fallback */ }
    }

    const defaultWeak = weakAreas.length ? weakAreas.slice(0, 5).map(w => w.concept) : ['Arrays', 'Strings', 'Searching & Sorting', 'Recursion', 'Time Management'];

    res.json({
      skillCounts,
      weakAreas,
      totalAssessments: assessments.length,
      aiAnalysis: aiAnalysis || {
        summary: `Assessment performance indicates solid participation across ${assessments.length} completed assessments. Students demonstrate strong basic loop logic, but show common performance drops in advanced array transformations and string manipulation.`,
        commonWeakAreas: defaultWeak,
        recommendations: [
          'Conduct weekly hands-on DSA problem-solving sessions for 2nd and 3rd year BCA students',
          'Organize timed coding hackathons to improve time management under assessment conditions',
          'Incorporate edge-case testing and dry-run debugging into department lab curricula'
        ],
        workshopSuggestions: [
          'Arrays & Data Structures Intensive Workshop',
          'Applied String Algorithms & Problem Solving Bootcamp'
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Question Generator (Requirement #35)
router.post('/generate-questions', async (req, res) => {
  try {
    const { skill = 'Python', difficulty = 'Medium', concept = 'Arrays', count = 5 } = req.body;
    const numCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10);

    const prompt = `Generate ${numCount} coding assessment questions for:
Skill: ${skill}
Difficulty: ${difficulty}
Concept: ${concept}

Each question carries 5 marks and must be realistic, balanced, with clear input/expected output and test cases.

Return ONLY a JSON array of question objects matching this exact schema:
[
  {
    "title": "Title of problem",
    "description": "Clear detailed problem statement",
    "skill": "${skill}",
    "concept": "${concept}",
    "difficulty": "${difficulty}",
    "inputFormat": "Input specification",
    "outputFormat": "Output specification",
    "sampleInput": "sample input string",
    "sampleOutput": "sample expected output string",
    "marks": 5,
    "expectedTime": 3,
    "testCases": [
      { "input": "sample input string", "expectedOutput": "sample output string", "isHidden": false },
      { "input": "hidden test input 1", "expectedOutput": "hidden expected output 1", "isHidden": true },
      { "input": "hidden test input 2", "expectedOutput": "hidden expected output 2", "isHidden": true }
    ]
  }
]`;

    const aiResponse = await callGemini(prompt);

    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        if (Array.isArray(questions) && questions.length > 0) {
          return res.json({ questions });
        }
      } catch (e) {
        console.error('AI question parse error:', e);
      }
    }

    // High quality template fallback question generator
    const templates = [
      {
        title: `Find Subarray with Target Sum (${concept})`,
        description: `Given an array of integers and a target sum, determine whether there exists a continuous subarray whose sum equals the target. Print "YES" if found, else "NO".`,
        sampleInput: `5 12\n1 2 3 7 5`,
        sampleOutput: `YES`,
        testCases: [
          { input: `5 12\n1 2 3 7 5`, expectedOutput: `YES`, isHidden: false },
          { input: `4 10\n1 2 3 4`, expectedOutput: `YES`, isHidden: true },
          { input: `3 100\n10 20 30`, expectedOutput: `NO`, isHidden: true }
        ]
      },
      {
        title: `Count Element Frequencies (${concept})`,
        description: `Read an array of integers and print each unique element with its frequency in the format "element:count" in order of first occurrence.`,
        sampleInput: `6\n2 3 2 5 3 2`,
        sampleOutput: `2:3 3:2 5:1`,
        testCases: [
          { input: `6\n2 3 2 5 3 2`, expectedOutput: `2:3 3:2 5:1`, isHidden: false },
          { input: `4\n1 1 1 1`, expectedOutput: `1:4`, isHidden: true },
          { input: `3\n5 8 9`, expectedOutput: `5:1 8:1 9:1`, isHidden: true }
        ]
      },
      {
        title: `Rotate Array by K Positions (${concept})`,
        description: `Given an array of n integers, rotate the array to the right by k steps using appropriate language features.`,
        sampleInput: `5 2\n1 2 3 4 5`,
        sampleOutput: `4 5 1 2 3`,
        testCases: [
          { input: `5 2\n1 2 3 4 5`, expectedOutput: `4 5 1 2 3`, isHidden: false },
          { input: `4 1\n10 20 30 40`, expectedOutput: `40 10 20 30`, isHidden: true }
        ]
      },
      {
        title: `Longest Consecutive Sequence (${concept})`,
        description: `Given an unsorted array of integers, find the length of the longest consecutive elements sequence without sorting the array.`,
        sampleInput: `6\n100 4 200 1 3 2`,
        sampleOutput: `4`,
        testCases: [
          { input: `6\n100 4 200 1 3 2`, expectedOutput: `4`, isHidden: false },
          { input: `5\n0 3 7 2 5 8 4 6 0 1`, expectedOutput: `9`, isHidden: true }
        ]
      },
      {
        title: `Peak Element Finder (${concept})`,
        description: `An element is a peak element if it is strictly greater than its neighbors. Find the value of any peak element in the given array.`,
        sampleInput: `4\n1 2 3 1`,
        sampleOutput: `3`,
        testCases: [
          { input: `4\n1 2 3 1`, expectedOutput: `3`, isHidden: false },
          { input: `3\n1 2 1`, expectedOutput: `2`, isHidden: true }
        ]
      }
    ];

    const questions = templates.slice(0, numCount).map((t, idx) => ({
      title: `${t.title} - Set ${idx + 1}`,
      description: t.description,
      skill,
      concept,
      difficulty,
      inputFormat: `Input format as described in problem statement`,
      outputFormat: `Standard space/newline formatted output`,
      sampleInput: t.sampleInput,
      sampleOutput: t.sampleOutput,
      marks: 5,
      expectedTime: difficulty === 'Easy' ? 2 : difficulty === 'Medium' ? 4 : 6,
      testCases: t.testCases
    }));

    res.json({ questions });
  } catch (err) {
    console.error('Generate questions error:', err);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

export default router;
