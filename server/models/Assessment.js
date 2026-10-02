import mongoose from 'mongoose';

const questionResponseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  questionIndex: { type: Number, required: true }, // 0-19
  code: { type: String, default: '' },
  status: {
    type: String,
    enum: ['not_attempted', 'in_progress', 'submitted', 'skipped'],
    default: 'not_attempted'
  },
  result: {
    type: String,
    enum: ['pending', 'correct', 'wrong', 'error', 'skipped'],
    default: 'pending'
  },
  output: { type: String },
  testCasesPassed: { type: Number, default: 0 },
  testCasesTotal: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // seconds spent on this question
  submittedAt: Date,
  lastRunOutput: { type: String },
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  skill: { type: String, required: true },
  questions: [questionResponseSchema],

  // Timing
  startedAt: { type: Date },
  completedAt: { type: Date },
  timeUsed: { type: Number }, // seconds
  timerStarted: { type: Boolean, default: false },

  // Scores (SERVER-CALCULATED ONLY)
  totalScore: { type: Number, default: 0 },
  questionsAttempted: { type: Number, default: 0 },
  questionsCorrect: { type: Number, default: 0 },
  questionsWrong: { type: Number, default: 0 },
  questionsSkipped: { type: Number, default: 0 },

  // Status
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'failed'],
    default: 'not_started'
  },

  // Anti-cheat
  tabSwitchDetected: { type: Boolean, default: false },
}, {
  timestamps: true
});

assessmentSchema.index({ studentId: 1 });
assessmentSchema.index({ status: 1 });

export default mongoose.model('Assessment', assessmentSchema);
