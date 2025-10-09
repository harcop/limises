import mongoose, { Schema, Document } from 'mongoose';

export interface IDispense extends Document {
  dispenseId: string;
  patientId: string;
  drugId: string;
  prescriptionId?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  dispensedBy: string;
  dispenseDate: string;
  dispenseTime: string;
  notes?: string;
  status: 'dispensed' | 'returned' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

const DispenseSchema = new Schema<IDispense>({
  dispenseId: {
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
  drugId: {
    type: String,
    required: true,
    index: true
  },
  prescriptionId: {
    type: String,
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
  dispensedBy: {
    type: String,
    required: true
  },
  dispenseDate: {
    type: String,
    required: true
  },
  dispenseTime: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['dispensed', 'returned', 'cancelled'],
    required: true,
    default: 'dispensed'
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
DispenseSchema.index({ patientId: 1, dispenseDate: -1 });
DispenseSchema.index({ drugId: 1, dispenseDate: -1 });
DispenseSchema.index({ dispensedBy: 1, dispenseDate: -1 });
DispenseSchema.index({ status: 1, dispenseDate: -1 });

export const DispenseModel = mongoose.model<IDispense>('Dispense', DispenseSchema);
