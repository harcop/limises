import mongoose, { Schema, Document } from 'mongoose';

export interface ILabSample extends Document {
  sampleId: string;
  orderId: string;
  sampleType: string;
  collectionDate: string;
  collectionTime: string;
  collectedBy?: string;
  sampleCondition?: string;
  storageLocation?: string;
  status: 'collected' | 'processed' | 'stored' | 'disposed';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const LabSampleSchema = new Schema<ILabSample>({
  sampleId: {
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
  sampleType: {
    type: String,
    required: true
  },
  collectionDate: {
    type: String,
    required: true
  },
  collectionTime: {
    type: String,
    required: true
  },
  collectedBy: {
    type: String
  },
  sampleCondition: {
    type: String
  },
  storageLocation: {
    type: String
  },
  status: {
    type: String,
    enum: ['collected', 'processed', 'stored', 'disposed'],
    required: true,
    default: 'collected'
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
LabSampleSchema.index({ orderId: 1, collectionDate: -1 });
LabSampleSchema.index({ sampleType: 1, status: 1 });

export const LabSampleModel = mongoose.model<ILabSample>('LabSample', LabSampleSchema);
