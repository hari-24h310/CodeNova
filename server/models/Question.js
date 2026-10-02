import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  skill: {
    type: String,
    required: true,
    enum: ['C', 'C++', 'Java', 'Python', 'JavaScript', 'Web Development', 'DSA', 'SQL', 'PHP', 'C#']
  },
  concept: { type: String, required: true, trim: true }, // e.g., "Loops", "Arrays", "Strings"
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard', 'Advanced']
  },
  inputFormat: { type: String },
  outputFormat: { type: String },
  sampleInput: { type: String },
  sampleOutput: { type: String },
  testCases: [testCaseSchema],
  marks: { type: Number, default: 5 },
  expectedTime: { type: Number, default: 3 }, // in minutes
  boilerplateCode: { type: String }, // optional starter code
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Indexes
questionSchema.index({ skill: 1, difficulty: 1 });
questionSchema.index({ skill: 1, concept: 1 });

export default mongoose.model('Question', questionSchema);
