import mongoose, { Schema, Document } from 'mongoose';
import { DrugMaster } from '../interfaces';

export interface IDrugMaster extends DrugMaster, Document {}

const DrugMasterSchema = new Schema<IDrugMaster>({
  drugId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique identifier for the drug'
  },
  drugName: {
    type: String,
    required: true,
    trim: true,
    description: 'Brand name of the drug'
  },
  genericName: {
    type: String,
    trim: true,
    description: 'Generic name of the drug'
  },
  drugClass: {
    type: String,
    description: 'Therapeutic class or category of the drug'
  },
  dosageForm: {
    type: String,
    description: 'Form of the drug (tablet, capsule, liquid, injection, etc.)'
  },
  strength: {
    type: String,
    description: 'Strength or concentration of the drug'
  },
  manufacturer: {
    type: String,
    description: 'Name of the pharmaceutical manufacturer'
  },
  ndcNumber: {
    type: String,
    unique: true,
    sparse: true,
    description: 'National Drug Code number for the drug'
  },
  isControlled: {
    type: Boolean,
    default: false,
    description: 'Whether this is a controlled substance'
  },
  controlledSchedule: {
    type: String,
    enum: ['I', 'II', 'III', 'IV', 'V'],
    description: 'DEA controlled substance schedule (I-V)'
  },
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether the drug is currently available for prescription'
  },
  description: {
    type: String,
    description: 'General description of the drug and its uses'
  },
  sideEffects: [{
    type: String,
    description: 'List of known side effects'
  }],
  contraindications: [{
    type: String,
    description: 'List of conditions where the drug should not be used'
  }],
  interactions: [{
    type: String,
    description: 'List of drug interactions'
  }]
}, {
  timestamps: true,
  collection: 'drug_master'
});

// Indexes for better performance
DrugMasterSchema.index({ drugName: 1 });
DrugMasterSchema.index({ genericName: 1 });
DrugMasterSchema.index({ drugClass: 1 });
DrugMasterSchema.index({ isControlled: 1 });
DrugMasterSchema.index({ isActive: 1 });
DrugMasterSchema.index({ ndcNumber: 1 });

export const DrugMasterModel = mongoose.model<IDrugMaster>('DrugMaster', DrugMasterSchema);
