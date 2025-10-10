import mongoose, { Schema, Document } from 'mongoose';
import { StaffAuth } from '../interfaces';

export interface IStaffAuth extends StaffAuth, Document {}

const StaffAuthSchema = new Schema<IStaffAuth>({
  authId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique identifier for the authentication record'
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
    ref: 'Staff',
    description: 'Reference to the staff member this auth record belongs to'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    description: 'Email address used for authentication'
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    description: 'Unique username for login'
  },
  password: {
    type: String,
    required: true,
    description: 'Hashed password for authentication'
  },
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether the authentication account is active'
  },
  emailVerified: {
    type: Boolean,
    default: false,
    description: 'Whether the email address has been verified'
  },
  lastLogin: {
    type: Date,
    description: 'Timestamp of the last successful login'
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
    description: 'Number of consecutive failed login attempts'
  },
  lockedUntil: {
    type: Date,
    description: 'Timestamp until which the account is locked due to failed attempts'
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
    description: 'Whether two-factor authentication is enabled'
  },
  twoFactorSecret: {
    type: String,
    description: 'Secret key for two-factor authentication'
  },
  roles: [{
    type: String,
    ref: 'StaffRole',
    description: 'Array of role references assigned to this staff member'
  }],
  permissions: [{
    type: String,
    ref: 'Permission',
    description: 'Array of permission references assigned to this staff member'
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
