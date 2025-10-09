import mongoose, { Document, Schema } from 'mongoose';
import { ISurgicalProcedure } from '../interfaces/IOperationTheatre';

export interface ISurgicalProcedureDocument extends ISurgicalProcedure, Document {}

const SurgicalProcedureSchema = new Schema<ISurgicalProcedureDocument>({
  procedureId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  procedureName: {
    type: String,
    required: true,
    unique: true
  },
  procedureCode: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    enum: ['major', 'minor', 'emergency', 'elective'],
    required: true,
    index: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: 1
  },
  description: {
    type: String
  },
  requirements: {
    type: Schema.Types.Mixed // JSON object
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'surgical_procedures'
});

// Indexes for performance
SurgicalProcedureSchema.index({ category: 1, isActive: 1 });
SurgicalProcedureSchema.index({ procedureName: 1 });

export const SurgicalProcedureModel = mongoose.model<ISurgicalProcedureDocument>('SurgicalProcedure', SurgicalProcedureSchema);
