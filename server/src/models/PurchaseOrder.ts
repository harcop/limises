import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseOrderItem {
  itemId: string;
  itemName: string;
  itemCode: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity?: number;
  remainingQuantity?: number;
}

export interface IPurchaseOrder extends Document {
  purchaseOrderId: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  
  // Order Details
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  
  // Items
  items: IPurchaseOrderItem[];
  
  // Totals
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  
  // Status
  status: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  
  // Approval
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Notes
  notes?: string;
  internalNotes?: string;
  
  // Metadata
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>({
  itemId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  itemCode: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  receivedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingQuantity: {
    type: Number,
    min: 0
  }
}, { _id: false });

const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  purchaseOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  supplierId: {
    type: String,
    required: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Order Details
  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  
  // Items
  items: [PurchaseOrderItemSchema],
  
  // Totals
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending_approval', 'approved', 'ordered', 'partially_received', 'received', 'cancelled'],
    default: 'draft'
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
  
  // Notes
  notes: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
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
  collection: 'purchase_orders'
});

// Indexes for better performance
PurchaseOrderSchema.index({ orderNumber: 1 });
PurchaseOrderSchema.index({ supplierId: 1 });
PurchaseOrderSchema.index({ status: 1 });
PurchaseOrderSchema.index({ orderDate: -1 });
PurchaseOrderSchema.index({ expectedDeliveryDate: 1 });
PurchaseOrderSchema.index({ createdBy: 1 });

// Pre-save middleware to calculate totals
PurchaseOrderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalCost, 0);
    
    // Calculate total amount
    this.totalAmount = this.subtotal + this.taxAmount + this.shippingCost;
    
    // Calculate remaining quantities
    this.items.forEach(item => {
      item.remainingQuantity = item.quantity - (item.receivedQuantity || 0);
    });
  }
  next();
});

export const PurchaseOrderModel = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
