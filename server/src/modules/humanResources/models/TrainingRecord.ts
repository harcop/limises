import mongoose, { Document, Schema } from 'mongoose';
import { ITrainingRecord } from '../interfaces/IHumanResources';

export interface ITrainingRecordDocument extends ITrainingRecord, Document {}

const TrainingRecordSchema = new Schema<ITrainingRecordDocument>({
  trainingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    ref: 'EmployeeRecord',
    index: true
  },
  trainingName: {
    type: String,
    required: true
  },
  trainingType: {
    type: String,
    enum: ['mandatory', 'optional', 'certification', 'continuing_education'],
    required: true,
    index: true
  },
  provider: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  certificateNumber: {
    type: String
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'training_records'
});

// Indexes for performance
TrainingRecordSchema.index({ employeeId: 1, completionDate: -1 });
TrainingRecordSchema.index({ trainingType: 1, status: 1 });
TrainingRecordSchema.index({ status: 1, completionDate: -1 });

export const TrainingRecordModel = mongoose.model<ITrainingRecordDocument>('TrainingRecord', TrainingRecordSchema);
