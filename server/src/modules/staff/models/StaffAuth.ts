import mongoose, { Schema, Document } from 'mongoose';
import { StaffAuth } from '../interfaces';

export interface IStaffAuth extends StaffAuth, Document {}

const StaffAuthSchema = new Schema<IStaffAuth>({
  authId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
    ref: 'Staff'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String
  },
  roles: [{
    type: String,
    ref: 'StaffRole'
  }],
  permissions: [{
    type: String,
    ref: 'Permission'
  }]
}, {
  timestamps: true,
  collection: 'staff_auth'
});

// Indexes for better performance
StaffAuthSchema.index({ email: 1 });
StaffAuthSchema.index({ username: 1 });
StaffAuthSchema.index({ staffId: 1 });
StaffAuthSchema.index({ isActive: 1 });

// Ensure password is not included in JSON output
StaffAuthSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.twoFactorSecret;
    return ret;
  }
});

export const StaffAuthModel = mongoose.model<IStaffAuth>('StaffAuth', StaffAuthSchema);
