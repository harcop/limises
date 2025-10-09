import mongoose, { Schema, Document } from 'mongoose';

export interface IPharmacyInventory extends Document {
  inventoryId: string;
  drugId: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  location?: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired';
  reorderLevel?: number;
  reorderQuantity?: number;
  createdAt: string;
  updatedAt?: string;
}

const PharmacyInventorySchema = new Schema<IPharmacyInventory>({
  inventoryId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  drugId: {
    type: String,
    required: true,
    index: true
  },
  batchNumber: {
    type: String
  },
  expiryDate: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['available', 'low_stock', 'out_of_stock', 'expired'],
    required: true,
    default: 'available'
  },
  reorderLevel: {
    type: Number,
    min: 0
  },
  reorderQuantity: {
    type: Number,
    min: 0
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
PharmacyInventorySchema.index({ drugId: 1, status: 1 });
PharmacyInventorySchema.index({ status: 1, quantity: 1 });
PharmacyInventorySchema.index({ expiryDate: 1 });

export const PharmacyInventoryModel = mongoose.model<IPharmacyInventory>('PharmacyInventory', PharmacyInventorySchema);
