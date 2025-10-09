import mongoose, { Schema, Document } from 'mongoose';
import { DrugMaster } from '../types';

export interface IDrugMaster extends DrugMaster, Document {}

const DrugMasterSchema = new Schema<IDrugMaster>({
  drugId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  drugName: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  drugClass: {
    type: String
  },
  dosageForm: {
    type: String
  },
  strength: {
    type: String
  },
  manufacturer: {
    type: String
  },
  ndcNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  isControlled: {
    type: Boolean,
    default: false
  },
  controlledSchedule: {
    type: String,
    enum: ['I', 'II', 'III', 'IV', 'V']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  },
  sideEffects: [{
    type: String
  }],
  contraindications: [{
    type: String
  }],
  interactions: [{
    type: String
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
