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
    index: true,
    description: 'Unique identifier for the laboratory order'
  },
  patientId: {
    type: String,
    required: true,
    index: true,
    description: 'Reference to the patient for this lab order'
  },
  staffId: {
    type: String,
    required: true,
    index: true,
    description: 'Reference to the healthcare provider who ordered the test'
  },
  appointmentId: {
    type: String,
    index: true,
    description: 'Reference to the appointment (if order is from an appointment)'
  },
  admissionId: {
    type: String,
    index: true,
    description: 'Reference to the admission (if order is from an inpatient stay)'
  },
  orderDate: {
    type: String,
    required: true,
    description: 'Date when the lab order was placed'
  },
  orderTime: {
    type: String,
    required: true,
    description: 'Time when the lab order was placed'
  },
  testType: {
    type: String,
    required: true,
    description: 'Type of laboratory test ordered'
  },
  testDescription: {
    type: String,
    description: 'Detailed description of the test'
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    required: true,
    default: 'routine',
    description: 'Priority level of the lab order'
  },
  status: {
    type: String,
    enum: ['ordered', 'collected', 'in_progress', 'completed', 'cancelled'],
    required: true,
    default: 'ordered',
    description: 'Current status of the lab order'
  },
  notes: {
    type: String,
    description: 'Additional notes about the lab order'
  },
  createdAt: {
    type: String,
    required: true,
    default: () => new Date().toISOString(),
    description: 'Timestamp when the record was created'
  },
  updatedAt: {
    type: String,
    description: 'Timestamp when the record was last updated'
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
