import mongoose from 'mongoose';
import crypto from 'crypto';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rollNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  registrationNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  department: { type: String, default: 'BCA', trim: true },
  year: { type: String, trim: true },
  section: { type: String, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  passwordSalt: { type: String, required: true },

  // Assessment tracking
  selectedSkill: { type: String },
  assessmentStatus: {
    type: String,
    enum: ['not_started', 'details_verified', 'rules_accepted', 'skill_selected', 'in_progress', 'completed', 'failed'],
    default: 'not_started'
  },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },

  // Journey tracking
  loginTime: Date,
  detailsVerifiedAt: Date,
  rulesAcceptedAt: Date,
  skillSelectedAt: Date,
  testStartedAt: Date,
  testCompletedAt: Date,
  tabSwitchDetected: { type: Boolean, default: false },
  tabSwitchCount: { type: Number, default: 0 },
}, {
  timestamps: true
});

studentSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  const hash = crypto.scryptSync(candidatePassword, this.passwordSalt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(this.password, 'hex'));
};

studentSchema.statics.hashPassword = function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
};

// Indexes
studentSchema.index({ assessmentStatus: 1 });
studentSchema.index({ selectedSkill: 1 });

export default mongoose.model('Student', studentSchema);
