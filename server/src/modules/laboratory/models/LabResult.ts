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
    index: true,
    description: 'Unique identifier for the laboratory result'
  },
  orderId: {
    type: String,
    required: true,
    index: true,
    description: 'Reference to the lab order this result belongs to'
  },
  sampleId: {
    type: String,
    index: true,
    description: 'Reference to the sample used for this result'
  },
  testName: {
    type: String,
    required: true,
    description: 'Name of the laboratory test'
  },
  resultValue: {
    type: String,
    description: 'The actual test result value'
  },
  normalRange: {
    type: String,
    description: 'Normal reference range for this test'
  },
  unit: {
    type: String,
    description: 'Unit of measurement for the result'
  },
  status: {
    type: String,
    enum: ['normal', 'abnormal', 'critical', 'pending'],
    required: true,
    default: 'pending',
    description: 'Status of the result (normal, abnormal, critical, or pending)'
  },
  verifiedBy: {
    type: String,
    description: 'Staff member who verified the result'
  },
  resultDate: {
    type: String,
    required: true,
    description: 'Date when the result was finalized'
  },
  resultTime: {
    type: String,
    required: true,
    description: 'Time when the result was finalized'
  },
  notes: {
    type: String,
    description: 'Additional notes about the result'
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
LabResultSchema.index({ orderId: 1, resultDate: -1 });
LabResultSchema.index({ testName: 1, status: 1 });
LabResultSchema.index({ status: 1, resultDate: -1 });

export const LabResultModel = mongoose.model<ILabResult>('LabResult', LabResultSchema);
