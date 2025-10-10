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
    index: true,
    description: 'Unique identifier for the inventory transaction'
  },
  itemId: {
    type: String,
    required: true,
    ref: 'InventoryItem',
    description: 'Reference to the inventory item being transacted'
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['receipt', 'issue', 'transfer', 'adjustment', 'return', 'waste', 'cycle_count'],
    description: 'Type of inventory transaction'
  },
  quantity: {
    type: Number,
    required: true,
    description: 'Quantity involved in the transaction (positive for receipts, negative for issues)'
  },
  unitCost: {
    type: Number,
    min: 0,
    description: 'Cost per unit at the time of transaction'
  },
  totalCost: {
    type: Number,
    min: 0,
    description: 'Total cost of the transaction (quantity × unit cost)'
  },
  
  // Location Information
  fromLocation: {
    type: String,
    trim: true,
    description: 'Source location for transfers and issues'
  },
  toLocation: {
    type: String,
    trim: true,
    description: 'Destination location for transfers and receipts'
  },
  
  // Reference Information
  referenceNumber: {
    type: String,
    trim: true,
    description: 'Reference number (PO number, patient ID, etc.)'
  },
  referenceType: {
    type: String,
    enum: ['purchase_order', 'patient', 'department', 'supplier', 'cycle_count'],
    description: 'Type of reference document'
  },
  
  // Batch/Lot Information
  batchNumber: {
    type: String,
    trim: true,
    description: 'Batch number for batch-tracked items'
  },
  lotNumber: {
    type: String,
    trim: true,
    description: 'Lot number for lot-tracked items'
  },
  serialNumber: {
    type: String,
    trim: true,
    description: 'Serial number for serial-tracked items'
  },
  expirationDate: {
    type: Date,
    description: 'Expiration date for the batch/lot'
  },
  
  // Transaction Details
  reason: {
    type: String,
    trim: true,
    description: 'Reason for the transaction'
  },
  notes: {
    type: String,
    trim: true,
    description: 'Additional notes about the transaction'
  },
  
  // Approval
  isApproved: {
    type: Boolean,
    default: false,
    description: 'Whether the transaction has been approved'
  },
  approvedBy: {
    type: String,
    ref: 'Staff',
    description: 'Staff member who approved the transaction'
  },
  approvedAt: {
    type: Date,
    description: 'Date and time when the transaction was approved'
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
    description: 'Current status of the transaction'
  },
  
  // Metadata
  createdBy: {
    type: String,
    required: true,
    ref: 'Staff',
    description: 'Staff member who created the transaction'
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
