import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryTransaction extends Document {
  transactionId: string;
  itemId: string;
  transactionType: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'return' | 'waste' | 'cycle_count';
  quantity: number; // Positive for receipts, negative for issues
  unitCost?: number;
  totalCost?: number;
  
  // Location Information
  fromLocation?: string;
  toLocation?: string;
  
  // Reference Information
  referenceNumber?: string; // PO number, patient ID, etc.
  referenceType?: 'purchase_order' | 'patient' | 'department' | 'supplier' | 'cycle_count';
  
  // Batch/Lot Information
  batchNumber?: string;
  lotNumber?: string;
  serialNumber?: string;
  expirationDate?: Date;
  
  // Transaction Details
  reason?: string;
  notes?: string;
  
  // Approval
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Status
  status: 'pending' | 'completed' | 'cancelled';
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  itemId: {
    type: String,
    required: true,
    ref: 'InventoryItem'
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['receipt', 'issue', 'transfer', 'adjustment', 'return', 'waste', 'cycle_count']
  },
  quantity: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    min: 0
  },
  totalCost: {
    type: Number,
    min: 0
  },
  
  // Location Information
  fromLocation: {
    type: String,
    trim: true
  },
  toLocation: {
    type: String,
    trim: true
  },
  
  // Reference Information
  referenceNumber: {
    type: String,
    trim: true
  },
  referenceType: {
    type: String,
    enum: ['purchase_order', 'patient', 'department', 'supplier', 'cycle_count']
  },
  
  // Batch/Lot Information
  batchNumber: {
    type: String,
    trim: true
  },
  lotNumber: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  expirationDate: {
    type: Date
  },
  
  // Transaction Details
  reason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Approval
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: String,
    ref: 'Staff'
  },
  approvedAt: {
    type: Date
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Metadata
  createdBy: {
    type: String,
    required: true,
    ref: 'Staff'
  }
}, {
  timestamps: true,
  collection: 'inventory_transactions'
});

// Indexes for better performance
InventoryTransactionSchema.index({ itemId: 1 });
InventoryTransactionSchema.index({ transactionType: 1 });
InventoryTransactionSchema.index({ status: 1 });
InventoryTransactionSchema.index({ fromLocation: 1 });
InventoryTransactionSchema.index({ toLocation: 1 });
InventoryTransactionSchema.index({ referenceNumber: 1 });
InventoryTransactionSchema.index({ batchNumber: 1 });
InventoryTransactionSchema.index({ lotNumber: 1 });
InventoryTransactionSchema.index({ expirationDate: 1 });
InventoryTransactionSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total cost
InventoryTransactionSchema.pre('save', function(next) {
  if (this.unitCost && this.quantity) {
    this.totalCost = this.unitCost * Math.abs(this.quantity);
  }
  next();
});

export const InventoryTransactionModel = mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
