import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  itemId: string;
  itemName: string;
  itemCode: string; // Barcode/SKU
  category: 'medication' | 'supplies' | 'equipment' | 'consumables' | 'other';
  subcategory?: string;
  description?: string;
  brand?: string;
  model?: string;
  unitOfMeasure: string; // pieces, boxes, liters, etc.
  size?: string;
  color?: string;
  
  // Stock Information
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  
  // Pricing
  unitCost: number;
  sellingPrice?: number;
  
  // Tracking
  batchTracking: boolean;
  expirationTracking: boolean;
  serialNumberTracking: boolean;
  
  // Location
  primaryLocation: string;
  secondaryLocations?: string[];
  
  // Status
  status: 'active' | 'inactive' | 'discontinued';
  isControlled: boolean; // For controlled substances
  
  // Supplier Information
  primarySupplier?: string;
  alternativeSuppliers?: string[];
  
  // Regulatory
  fdaApprovalNumber?: string;
  ndcNumber?: string; // National Drug Code
  lotNumber?: string;
  expirationDate?: Date;
  
  // Metadata
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>({
  itemId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['medication', 'supplies', 'equipment', 'consumables', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  unitOfMeasure: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  
  // Stock Information
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  maximumStock: {
    type: Number,
    required: true,
    default: 1000,
    min: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  reorderQuantity: {
    type: Number,
    required: true,
    default: 50,
    min: 0
  },
  
  // Pricing
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    min: 0
  },
  
  // Tracking
  batchTracking: {
    type: Boolean,
    default: false
  },
  expirationTracking: {
    type: Boolean,
    default: false
  },
  serialNumberTracking: {
    type: Boolean,
    default: false
  },
  
  // Location
  primaryLocation: {
    type: String,
    required: true,
    trim: true
  },
  secondaryLocations: [{
    type: String,
    trim: true
  }],
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  isControlled: {
    type: Boolean,
    default: false
  },
  
  // Supplier Information
  primarySupplier: {
    type: String,
    trim: true
  },
  alternativeSuppliers: [{
    type: String,
    trim: true
  }],
  
  // Regulatory
  fdaApprovalNumber: {
    type: String,
    trim: true
  },
  ndcNumber: {
    type: String,
    trim: true
  },
  lotNumber: {
    type: String,
    trim: true
  },
  expirationDate: {
    type: Date
  },
  
  // Metadata
  createdBy: {
    type: String,
    required: true,
    ref: 'Staff'
  },
  updatedBy: {
    type: String,
    ref: 'Staff'
  }
}, {
  timestamps: true,
  collection: 'inventory_items'
});

// Indexes for better performance
InventoryItemSchema.index({ itemCode: 1 });
InventoryItemSchema.index({ category: 1 });
InventoryItemSchema.index({ subcategory: 1 });
InventoryItemSchema.index({ status: 1 });
InventoryItemSchema.index({ primaryLocation: 1 });
InventoryItemSchema.index({ currentStock: 1 });
InventoryItemSchema.index({ reorderPoint: 1 });
InventoryItemSchema.index({ expirationDate: 1 });
InventoryItemSchema.index({ createdAt: -1 });

// Virtual for low stock check
InventoryItemSchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.reorderPoint;
});

// Virtual for overstock check
InventoryItemSchema.virtual('isOverstock').get(function() {
  return this.currentStock > this.maximumStock;
});

// Ensure virtual fields are serialized
InventoryItemSchema.set('toJSON', {
  virtuals: true
});

export const InventoryItemModel = mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
