import mongoose, { Document, Schema } from 'mongoose';
import { IOTSchedule } from '../interfaces/IOperationTheatre';

export interface IOTScheduleDocument extends IOTSchedule, Document {}

const OTScheduleSchema = new Schema<IOTScheduleDocument>({
  scheduleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  theatreId: {
    type: String,
    required: true,
    ref: 'OperationTheatre',
    index: true
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient',
    index: true
  },
  procedureId: {
    type: String,
    required: true,
    ref: 'SurgicalProcedure',
    index: true
  },
  surgeonId: {
    type: String,
    required: true,
    ref: 'Staff',
    index: true
  },
  anesthetistId: {
    type: String,
    ref: 'Staff'
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled',
    index: true
  },
  notes: {
    type: String
  },
  preOpNotes: {
    type: String
  },
  postOpNotes: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'ot_schedules'
});

// Indexes for performance
OTScheduleSchema.index({ theatreId: 1, scheduledDate: 1 });
OTScheduleSchema.index({ patientId: 1, scheduledDate: -1 });
OTScheduleSchema.index({ surgeonId: 1, scheduledDate: -1 });
OTScheduleSchema.index({ status: 1, scheduledDate: -1 });

export const OTScheduleModel = mongoose.model<IOTScheduleDocument>('OTSchedule', OTScheduleSchema);
