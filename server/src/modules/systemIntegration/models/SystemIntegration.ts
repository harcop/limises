import mongoose, { Document, Schema } from 'mongoose';
import { ISystemIntegration } from '../interfaces/ISystemIntegration';

export interface ISystemIntegrationDocument extends ISystemIntegration, Document {}

const SystemIntegrationSchema = new Schema<ISystemIntegrationDocument>({
  integrationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  systemName: {
    type: String,
    required: true,
    unique: true
  },
  systemType: {
    type: String,
    enum: ['internal', 'external', 'third_party'],
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true
  },
  authenticationType: {
    type: String,
    enum: ['api_key', 'oauth', 'basic', 'certificate'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'maintenance'],
    default: 'active',
    index: true
  },
  lastSync: {
    type: Date
  },
  syncFrequency: {
    type: String
  },
  configuration: {
    type: Schema.Types.Mixed // JSON object
  }
}, {
  timestamps: true,
  collection: 'system_integrations'
});

// Indexes for performance
SystemIntegrationSchema.index({ systemType: 1, status: 1 });
SystemIntegrationSchema.index({ status: 1 });

export const SystemIntegrationModel = mongoose.model<ISystemIntegrationDocument>('SystemIntegration', SystemIntegrationSchema);
