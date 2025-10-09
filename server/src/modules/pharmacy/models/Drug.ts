import mongoose, { Schema, Document } from 'mongoose';

export interface IDrug extends Document {
  drugId: string;
  drugName: string;
  genericName?: string;
  drugClass?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  ndcNumber?: string;
  isControlled: boolean;
  controlledSchedule?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt?: string;
}

const DrugSchema = new Schema<IDrug>({
  drugId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  drugName: {
    type: String,
    required: true,
    index: true
  },
  genericName: {
    type: String,
    index: true
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
    required: true,
    default: false
  },
  controlledSchedule: {
    type: String,
    enum: ['I', 'II', 'III', 'IV', 'V']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    required: true,
    default: 'active'
  },
  createdAt: {
    type: String,
    required: true,
    default: () => new Date().toISOString()
  },
  updatedAt: {
    type: String
  }
}, {
  timestamps: false,
  versionKey: false
});

// Indexes for better query performance
DrugSchema.index({ drugName: 1, status: 1 });
DrugSchema.index({ genericName: 1 });
DrugSchema.index({ drugClass: 1 });
DrugSchema.index({ isControlled: 1, controlledSchedule: 1 });

export const DrugModel = mongoose.model<IDrug>('Drug', DrugSchema);
