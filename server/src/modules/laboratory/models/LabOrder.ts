import mongoose, { Schema, Document } from 'mongoose';

export interface ILabOrder extends Document {
  orderId: string;
  patientId: string;
  staffId: string;
  appointmentId?: string;
  admissionId?: string;
  orderDate: string;
  orderTime: string;
  testType: string;
  testDescription?: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'collected' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const LabOrderSchema = new Schema<ILabOrder>({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  staffId: {
    type: String,
    required: true,
    index: true
  },
  appointmentId: {
    type: String,
    index: true
  },
  admissionId: {
    type: String,
    index: true
  },
  orderDate: {
    type: String,
    required: true
  },
  orderTime: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  testDescription: {
    type: String
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    required: true,
    default: 'routine'
  },
  status: {
    type: String,
    enum: ['ordered', 'collected', 'in_progress', 'completed', 'cancelled'],
    required: true,
    default: 'ordered'
  },
  notes: {
    type: String
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
LabOrderSchema.index({ patientId: 1, orderDate: -1 });
LabOrderSchema.index({ staffId: 1, orderDate: -1 });
LabOrderSchema.index({ status: 1, priority: 1 });

export const LabOrderModel = mongoose.model<ILabOrder>('LabOrder', LabOrderSchema);
