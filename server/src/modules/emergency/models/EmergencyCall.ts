import mongoose, { Document, Schema } from 'mongoose';
import { IEmergencyCall } from '../interfaces/IEmergency';

export interface IEmergencyCallDocument extends IEmergencyCall, Document {}

const EmergencyCallSchema = new Schema<IEmergencyCallDocument>({
  callId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  callerName: {
    type: String
  },
  callerPhone: {
    type: String,
    required: true
  },
  patientName: {
    type: String
  },
  patientAge: {
    type: Number
  },
  patientGender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  emergencyType: {
    type: String,
    enum: ['medical', 'trauma', 'psychiatric', 'obstetric', 'pediatric'],
    required: true,
    index: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  ambulanceId: {
    type: String,
    ref: 'AmbulanceService'
  },
  dispatchTime: {
    type: Date
  },
  arrivalTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'arrived', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true,
  collection: 'emergency_calls'
});

// Indexes for performance
EmergencyCallSchema.index({ status: 1, priority: 1 });
EmergencyCallSchema.index({ emergencyType: 1, status: 1 });
EmergencyCallSchema.index({ ambulanceId: 1 });
EmergencyCallSchema.index({ createdAt: -1 });

export const EmergencyCallModel = mongoose.model<IEmergencyCallDocument>('EmergencyCall', EmergencyCallSchema);
