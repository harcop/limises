import mongoose, { Document, Schema } from 'mongoose';
import { IEmergencyVisit } from '../interfaces/IEmergency';

export interface IEmergencyVisitDocument extends IEmergencyVisit, Document {}

const EmergencyVisitSchema = new Schema<IEmergencyVisitDocument>({
  visitId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient',
    index: true
  },
  staffId: {
    type: String,
    required: true,
    ref: 'Staff',
    index: true
  },
  visitDate: {
    type: Date,
    required: true,
    index: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  triageLevel: {
    type: String,
    enum: ['1', '2', '3', '4', '5'],
    required: true,
    index: true
  },
  chiefComplaint: {
    type: String
  },
  vitalSigns: {
    type: Schema.Types.Mixed // JSON object
  },
  initialAssessment: {
    type: String
  },
  treatmentPlan: {
    type: String
  },
  disposition: {
    type: String,
    enum: ['discharge', 'admit', 'transfer', 'observation'],
    required: true,
    index: true
  },
  dischargeTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'transferred'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  collection: 'emergency_visits'
});

// Indexes for performance
EmergencyVisitSchema.index({ patientId: 1, visitDate: -1 });
EmergencyVisitSchema.index({ staffId: 1, visitDate: -1 });
EmergencyVisitSchema.index({ triageLevel: 1, status: 1 });
EmergencyVisitSchema.index({ disposition: 1, status: 1 });

export const EmergencyVisitModel = mongoose.model<IEmergencyVisitDocument>('EmergencyVisit', EmergencyVisitSchema);
