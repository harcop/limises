import mongoose, { Document, Schema } from 'mongoose';
import { IWard } from '../interfaces/IIPD';

export interface IWardDocument extends IWard, Document {}

const WardSchema = new Schema<IWardDocument>({
  wardId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  wardName: {
    type: String,
    required: true,
    unique: true
  },
  wardType: {
    type: String,
    enum: ['general', 'icu', 'ccu', 'pediatric', 'maternity', 'surgical', 'medical'],
    required: true,
    index: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'wards'
});

// Indexes for performance
WardSchema.index({ wardType: 1, isActive: 1 });
WardSchema.index({ currentOccupancy: 1 });

export const WardModel = mongoose.model<IWardDocument>('Ward', WardSchema);
