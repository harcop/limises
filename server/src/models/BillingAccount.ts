import mongoose, { Schema, Document } from 'mongoose';
import { BillingAccount } from '../types';

export interface IBillingAccount extends BillingAccount, Document {}

const BillingAccountSchema = new Schema<IBillingAccount>({
  accountId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'billing_accounts'
});

// Indexes for better performance
BillingAccountSchema.index({ patientId: 1 });
BillingAccountSchema.index({ accountNumber: 1 });
BillingAccountSchema.index({ status: 1 });

export const BillingAccountModel = mongoose.model<IBillingAccount>('BillingAccount', BillingAccountSchema);
