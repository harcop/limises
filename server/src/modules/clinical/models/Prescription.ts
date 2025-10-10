import mongoose, { Schema, Document } from 'mongoose';
import { Prescription } from '../interfaces';

export interface IPrescription extends Prescription, Document {}

const PrescriptionSchema = new Schema<IPrescription>({
  prescriptionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique identifier for the prescription'
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient',
    description: 'Reference to the patient this prescription is for'
  },
  staffId: {
    type: String,
    required: true,
    ref: 'Staff',
    description: 'Reference to the healthcare provider who prescribed the medication'
  },
  drugId: {
    type: String,
    required: true,
    ref: 'DrugMaster',
    description: 'Reference to the drug in the drug master database'
  },
  dosage: {
    type: String,
    required: true,
    description: 'Dosage amount and unit (e.g., 500mg, 1 tablet)'
  },
  frequency: {
    type: String,
    required: true,
    description: 'How often to take the medication (e.g., twice daily, every 8 hours)'
  },
  duration: {
    type: String,
    required: true,
    description: 'How long to take the medication (e.g., 7 days, until finished)'
  },
  quantity: {
    type: Number,
    required: true,
    description: 'Total quantity prescribed'
  },
  refillsAllowed: {
    type: Number,
    default: 0,
    description: 'Number of refills allowed for this prescription'
  },
  refillsUsed: {
    type: Number,
    default: 0,
    description: 'Number of refills already used'
  },
  instructions: {
    type: String,
    description: 'Special instructions for taking the medication'
  },
  prescribedAt: {
    type: Date,
    default: Date.now,
    description: 'Date and time when the prescription was written'
  },
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether the prescription is currently active'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active',
    description: 'Current status of the prescription'
  },
  expiryDate: {
    type: Date,
    description: 'Date when the prescription expires'
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
