import mongoose, { Schema, Document } from 'mongoose';

export interface ICharge extends Document {
  chargeId: string;
  patientId: string;
  accountId: string;
  serviceType: string;
  serviceDescription?: string;
  serviceDate: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const ChargeSchema = new Schema<ICharge>({
  chargeId: {
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
  serviceType: {
    type: String,
    required: true,
    index: true
  },
  serviceDescription: {
    type: String
  },
  serviceDate: {
    type: String,
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'refunded'],
    required: true,
    default: 'pending',
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
ChargeSchema.index({ patientId: 1, serviceDate: -1 });
ChargeSchema.index({ accountId: 1, serviceDate: -1 });
ChargeSchema.index({ serviceType: 1, status: 1 });
ChargeSchema.index({ status: 1, serviceDate: -1 });

export const ChargeModel = mongoose.model<ICharge>('Charge', ChargeSchema);
