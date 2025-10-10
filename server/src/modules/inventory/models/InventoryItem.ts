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
    index: true,
    description: 'Unique identifier for the inventory item'
  },
  itemName: {
    type: String,
    required: true,
    trim: true,
    description: 'Name of the inventory item'
  },
  itemCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Barcode or SKU code for the item'
  },
  category: {
    type: String,
    required: true,
    enum: ['medication', 'supplies', 'equipment', 'consumables', 'other'],
    description: 'Category classification of the inventory item'
  },
  subcategory: {
    type: String,
    trim: true,
    description: 'Subcategory for more specific classification'
  },
  description: {
    type: String,
    trim: true,
    description: 'Detailed description of the item'
  },
  brand: {
    type: String,
    trim: true,
    description: 'Brand or manufacturer of the item'
  },
  model: {
    type: String,
    trim: true,
    description: 'Model number or version of the item'
  },
  unitOfMeasure: {
    type: String,
    required: true,
    trim: true,
    description: 'Unit of measurement (pieces, boxes, liters, etc.)'
  },
  size: {
    type: String,
    trim: true,
    description: 'Size specification of the item'
  },
  color: {
    type: String,
    trim: true,
    description: 'Color of the item'
  },
  
  // Stock Information
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    description: 'Current quantity in stock'
  },
  minimumStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    description: 'Minimum stock level to maintain'
  },
  maximumStock: {
    type: Number,
    required: true,
    default: 1000,
    min: 0,
    description: 'Maximum stock level allowed'
  },
  reorderPoint: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
    description: 'Stock level at which to trigger reorder'
  },
  reorderQuantity: {
    type: Number,
    required: true,
    default: 50,
    min: 0,
    description: 'Quantity to order when reorder point is reached'
  },
  
  // Pricing
  unitCost: {
    type: Number,
    required: true,
    min: 0,
    description: 'Cost per unit of the item'
  },
  sellingPrice: {
    type: Number,
    min: 0,
    description: 'Selling price per unit (if applicable)'
  },
  
  // Tracking
  batchTracking: {
    type: Boolean,
    default: false,
    description: 'Whether batch tracking is required for this item'
  },
  expirationTracking: {
    type: Boolean,
    default: false,
    description: 'Whether expiration date tracking is required'
  },
  serialNumberTracking: {
    type: Boolean,
    default: false,
    description: 'Whether serial number tracking is required'
  },
  
  // Location
  primaryLocation: {
    type: String,
    required: true,
    trim: true,
    description: 'Primary storage location for the item'
  },
  secondaryLocations: [{
    type: String,
    trim: true,
    description: 'Additional storage locations'
  }],
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active',
    description: 'Current status of the inventory item'
  },
  isControlled: {
    type: Boolean,
    default: false,
    description: 'Whether this is a controlled substance'
  },
  
  // Supplier Information
  primarySupplier: {
    type: String,
    trim: true,
    description: 'Primary supplier for this item'
  },
  alternativeSuppliers: [{
    type: String,
    trim: true,
    description: 'Alternative suppliers for this item'
  }],
  
  // Regulatory
  fdaApprovalNumber: {
    type: String,
    trim: true,
    description: 'FDA approval number (for medications)'
  },
  ndcNumber: {
    type: String,
    trim: true,
    description: 'National Drug Code number'
  },
  lotNumber: {
    type: String,
    trim: true,
    description: 'Current lot number'
  },
  expirationDate: {
    type: Date,
    description: 'Expiration date of current lot'
  },
  
  // Metadata
  createdBy: {
    type: String,
    required: true,
    ref: 'Staff',
    description: 'Staff member who created this record'
  },
  updatedBy: {
    type: String,
    ref: 'Staff',
    description: 'Staff member who last updated this record'
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
