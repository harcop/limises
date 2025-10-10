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
    required: true,
    description: 'Unique identifier of the inventory item'
  },
  itemName: {
    type: String,
    required: true,
    description: 'Name of the inventory item'
  },
  itemCode: {
    type: String,
    required: true,
    description: 'Barcode or SKU code of the item'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    description: 'Quantity ordered'
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
    description: 'Cost per unit'
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
    description: 'Total cost for this line item (quantity × unit cost)'
  },
  receivedQuantity: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Quantity received so far'
  },
  remainingQuantity: {
    type: Number,
    min: 0,
    description: 'Quantity still pending receipt'
  }
}, { _id: false });

const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  purchaseOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique identifier for the purchase order'
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Human-readable order number'
  },
  supplierId: {
    type: String,
    required: true,
    description: 'Unique identifier of the supplier'
  },
  supplierName: {
    type: String,
    required: true,
    trim: true,
    description: 'Name of the supplier company'
  },
  
  // Order Details
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
    description: 'Date when the order was placed'
  },
  expectedDeliveryDate: {
    type: Date,
    description: 'Expected delivery date from supplier'
  },
  actualDeliveryDate: {
    type: Date,
    description: 'Actual delivery date when received'
  },
  
  // Items
  items: [PurchaseOrderItemSchema],
  
  // Totals
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    description: 'Subtotal amount before tax and shipping'
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Tax amount on the order'
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Shipping and handling costs'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    description: 'Total order amount including tax and shipping'
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending_approval', 'approved', 'ordered', 'partially_received', 'received', 'cancelled'],
    default: 'draft',
    description: 'Current status of the purchase order'
  },
  
  // Approval
  isApproved: {
    type: Boolean,
    default: false,
    description: 'Whether the order has been approved'
  },
  approvedBy: {
    type: String,
    ref: 'Staff',
    description: 'Staff member who approved the order'
  },
  approvedAt: {
    type: Date,
    description: 'Date and time when the order was approved'
  },
  
  // Notes
  notes: {
    type: String,
    trim: true,
    description: 'Public notes visible to supplier'
  },
  internalNotes: {
    type: String,
    trim: true,
    description: 'Internal notes for staff only'
  },
  
  // Metadata
  createdBy: {
    type: String,
    required: true,
    ref: 'Staff',
    description: 'Staff member who created the order'
  },
  updatedBy: {
    type: String,
    ref: 'Staff',
    description: 'Staff member who last updated the order'
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
