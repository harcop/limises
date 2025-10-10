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
    index: true,
    description: 'Unique identifier for the laboratory sample'
  },
  orderId: {
    type: String,
    required: true,
    index: true,
    description: 'Reference to the lab order this sample belongs to'
  },
  sampleType: {
    type: String,
    required: true,
    description: 'Type of sample (blood, urine, tissue, etc.)'
  },
  collectionDate: {
    type: String,
    required: true,
    description: 'Date when the sample was collected'
  },
  collectionTime: {
    type: String,
    required: true,
    description: 'Time when the sample was collected'
  },
  collectedBy: {
    type: String,
    description: 'Staff member who collected the sample'
  },
  sampleCondition: {
    type: String,
    description: 'Condition of the sample (good, hemolyzed, clotted, etc.)'
  },
  storageLocation: {
    type: String,
    description: 'Location where the sample is stored'
  },
  status: {
    type: String,
    enum: ['collected', 'processed', 'stored', 'disposed'],
    required: true,
    default: 'collected',
    description: 'Current status of the sample'
  },
  notes: {
    type: String,
    description: 'Additional notes about the sample'
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
LabSampleSchema.index({ orderId: 1, collectionDate: -1 });
LabSampleSchema.index({ sampleType: 1, status: 1 });

export const LabSampleModel = mongoose.model<ILabSample>('LabSample', LabSampleSchema);
