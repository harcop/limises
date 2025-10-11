import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentId: string;
  patientId: string;
  accountId: string;
  paymentMethod: string;
  paymentAmount: number;
  paymentDate: string;
  referenceNumber?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const PaymentSchema = new Schema<IPayment>({
  paymentId: {
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
  accountId: {
    type: String,
    required: true,
    index: true
  },
  paymentMethod: {
    type: String,
    required: true,
    index: true
  },
  paymentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: String,
    required: true,
    index: true
  },
  referenceNumber: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed', 'refunded'],
    required: true,
    default: 'completed',
    index: true
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
PaymentSchema.index({ patientId: 1, paymentDate: -1 });
PaymentSchema.index({ accountId: 1, paymentDate: -1 });
PaymentSchema.index({ paymentMethod: 1, status: 1 });
PaymentSchema.index({ status: 1, paymentDate: -1 });

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
