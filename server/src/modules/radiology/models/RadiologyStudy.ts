import mongoose, { Document, Schema } from 'mongoose';
import { IRadiologyStudy } from '../interfaces/IRadiology';

export interface IRadiologyStudyDocument extends IRadiologyStudy, Document {}

const RadiologyStudySchema = new Schema<IRadiologyStudyDocument>({
  studyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    ref: 'RadiologyOrder',
    index: true
  },
  studyDate: {
    type: Date,
    required: true,
    index: true
  },
  modality: {
    type: String,
    required: true,
    index: true
  },
  bodyPart: {
    type: String,
    required: true,
    index: true
  },
  technique: {
    type: String
  },
  findings: {
    type: String
  },
  impression: {
    type: String
  },
  recommendations: {
    type: String
  },
  radiologistId: {
    type: String,
    ref: 'Staff'
  },
  technologistId: {
    type: String,
    ref: 'Staff'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  }
}, {
  timestamps: true,
  collection: 'radiology_studies'
});

// Indexes for performance
RadiologyStudySchema.index({ orderId: 1 });
RadiologyStudySchema.index({ studyDate: -1 });
RadiologyStudySchema.index({ modality: 1, status: 1 });
RadiologyStudySchema.index({ radiologistId: 1 });

export const RadiologyStudyModel = mongoose.model<IRadiologyStudyDocument>('RadiologyStudy', RadiologyStudySchema);
