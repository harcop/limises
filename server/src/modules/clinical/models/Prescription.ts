import mongoose, { Schema, Document } from 'mongoose';
import { Prescription } from '../interfaces';

export interface IPrescription extends Prescription, Document {}

const PrescriptionSchema = new Schema<IPrescription>({
  prescriptionId: {
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
  drugId: {
    type: String,
    required: true,
    ref: 'DrugMaster'
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  refillsAllowed: {
    type: Number,
    default: 0
  },
  refillsUsed: {
    type: Number,
    default: 0
  },
  instructions: {
    type: String
  },
  prescribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'prescriptions'
});

// Indexes for better performance
PrescriptionSchema.index({ patientId: 1 });
PrescriptionSchema.index({ staffId: 1 });
PrescriptionSchema.index({ drugId: 1 });
PrescriptionSchema.index({ isActive: 1 });
PrescriptionSchema.index({ status: 1 });
PrescriptionSchema.index({ prescribedAt: -1 });

export const PrescriptionModel = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
