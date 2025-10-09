import mongoose, { Document, Schema } from 'mongoose';
import { IOTConsumable } from '../interfaces/IOperationTheatre';

export interface IOTConsumableDocument extends IOTConsumable, Document {}

const OTConsumableSchema = new Schema<IOTConsumableDocument>({
  consumptionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  scheduleId: {
    type: String,
    required: true,
    ref: 'OTSchedule',
    index: true
  },
  itemId: {
    type: String,
    required: true,
    ref: 'InventoryItem',
    index: true
  },
  quantityUsed: {
    type: Number,
    required: true,
    min: 1
  },
  unitCost: {
    type: Number,
    min: 0
  },
  totalCost: {
    type: Number,
    min: 0
  },
  batchNumber: {
    type: String
  },
  expiryDate: {
    type: Date
  },
  usedBy: {
    type: String,
    required: true,
    ref: 'Staff'
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'ot_consumables'
});

// Indexes for performance
OTConsumableSchema.index({ scheduleId: 1 });
OTConsumableSchema.index({ itemId: 1 });
OTConsumableSchema.index({ usedBy: 1 });

export const OTConsumableModel = mongoose.model<IOTConsumableDocument>('OTConsumable', OTConsumableSchema);
