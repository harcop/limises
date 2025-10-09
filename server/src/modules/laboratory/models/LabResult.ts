import mongoose, { Schema, Document } from 'mongoose';

export interface ILabResult extends Document {
  resultId: string;
  orderId: string;
  sampleId?: string;
  testName: string;
  resultValue?: string;
  normalRange?: string;
  unit?: string;
  status: 'normal' | 'abnormal' | 'critical' | 'pending';
  verifiedBy?: string;
  resultDate: string;
  resultTime: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const LabResultSchema = new Schema<ILabResult>({
  resultId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  sampleId: {
    type: String,
    index: true
  },
  testName: {
    type: String,
    required: true
  },
  resultValue: {
    type: String
  },
  normalRange: {
    type: String
  },
  unit: {
    type: String
  },
  status: {
    type: String,
    enum: ['normal', 'abnormal', 'critical', 'pending'],
    required: true,
    default: 'pending'
  },
  verifiedBy: {
    type: String
  },
  resultDate: {
    type: String,
    required: true
  },
  resultTime: {
    type: String,
    required: true
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
LabResultSchema.index({ orderId: 1, resultDate: -1 });
LabResultSchema.index({ testName: 1, status: 1 });
LabResultSchema.index({ status: 1, resultDate: -1 });

export const LabResultModel = mongoose.model<ILabResult>('LabResult', LabResultSchema);
