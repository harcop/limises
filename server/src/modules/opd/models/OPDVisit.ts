import mongoose, { Document, Schema } from 'mongoose';
import { IOPDVisit } from '../interfaces/IOPD';

export interface IOPDVisitDocument extends IOPDVisit, Document {}

const OPDVisitSchema = new Schema<IOPDVisitDocument>({
  visitId: {
    type: String,
    required: true,
    unique: true,
    index: true
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
  appointmentId: {
    type: String,
    ref: 'Appointment'
  },
  visitDate: {
    type: Date,
    required: true,
    index: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date
  },
  chiefComplaint: {
    type: String
  },
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number
  },
  status: {
    type: String,
    enum: ['checked_in', 'in_queue', 'with_doctor', 'completed', 'cancelled'],
    default: 'checked_in',
    index: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'opd_visits'
});

// Indexes for performance
OPDVisitSchema.index({ patientId: 1, visitDate: -1 });
OPDVisitSchema.index({ staffId: 1, visitDate: -1 });
OPDVisitSchema.index({ status: 1, visitDate: -1 });

export const OPDVisitModel = mongoose.model<IOPDVisitDocument>('OPDVisit', OPDVisitSchema);
