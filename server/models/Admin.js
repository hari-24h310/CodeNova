import mongoose from 'mongoose';
import crypto from 'crypto';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  lastLogin: Date,
}, {
  timestamps: true
});

adminSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  const hash = crypto.scryptSync(candidatePassword, this.passwordSalt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(this.password, 'hex'));
};

adminSchema.statics.hashPassword = function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
};

export default mongoose.model('Admin', adminSchema);
