import mongoose, { Document, Schema } from 'mongoose';
import { ISecurityAudit } from '../interfaces/ISystemIntegration';

export interface ISecurityAuditDocument extends ISecurityAudit, Document {}

const SecurityAuditSchema = new Schema<ISecurityAuditDocument>({
  auditId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    ref: 'Staff',
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  resource: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userAgent: {
    type: String
  },
  success: {
    type: Boolean,
    required: true,
    index: true
  },
  details: {
    type: Schema.Types.Mixed // JSON object
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'security_audits'
});

// Indexes for performance
SecurityAuditSchema.index({ userId: 1, createdAt: -1 });
SecurityAuditSchema.index({ action: 1, createdAt: -1 });
SecurityAuditSchema.index({ resource: 1, createdAt: -1 });
SecurityAuditSchema.index({ success: 1, createdAt: -1 });
SecurityAuditSchema.index({ ipAddress: 1, createdAt: -1 });

export const SecurityAuditModel = mongoose.model<ISecurityAuditDocument>('SecurityAudit', SecurityAuditSchema);
