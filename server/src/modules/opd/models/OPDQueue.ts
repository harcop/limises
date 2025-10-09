import mongoose, { Document, Schema } from 'mongoose';
import { IOPDQueue } from '../interfaces/IOPD';

export interface IOPDQueueDocument extends IOPDQueue, Document {}

const OPDQueueSchema = new Schema<IOPDQueueDocument>({
  queueId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  visitId: {
    type: String,
    required: true,
    ref: 'OPDVisit'
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  staffId: {
    type: String,
    required: true,
    ref: 'Staff'
  },
  queueNumber: {
    type: Number,
    required: true,
    index: true
  },
  estimatedWaitTime: {
    type: Number // in minutes
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed', 'cancelled'],
    default: 'waiting',
    index: true
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal',
    index: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'opd_queue'
});

// Indexes for performance
OPDQueueSchema.index({ staffId: 1, status: 1 });
OPDQueueSchema.index({ queueNumber: 1, status: 1 });
OPDQueueSchema.index({ priority: 1, status: 1 });

export const OPDQueueModel = mongoose.model<IOPDQueueDocument>('OPDQueue', OPDQueueSchema);
