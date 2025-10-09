import mongoose, { Document, Schema } from 'mongoose';
import { IBed } from '../interfaces/IIPD';

export interface IBedDocument extends IBed, Document {}

const BedSchema = new Schema<IBedDocument>({
  bedId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  wardId: {
    type: String,
    required: true,
    ref: 'Ward',
    index: true
  },
  bedNumber: {
    type: String,
    required: true
  },
  bedType: {
    type: String,
    enum: ['standard', 'private', 'semi_private', 'icu', 'isolation'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available',
    index: true
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'beds'
});

// Indexes for performance
BedSchema.index({ wardId: 1, status: 1 });
BedSchema.index({ bedType: 1, status: 1 });
BedSchema.index({ bedNumber: 1, wardId: 1 }, { unique: true });

export const BedModel = mongoose.model<IBedDocument>('Bed', BedSchema);
