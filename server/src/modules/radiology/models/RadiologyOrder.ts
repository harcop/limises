import mongoose, { Document, Schema } from 'mongoose';
import { IRadiologyOrder } from '../interfaces/IRadiology';

export interface IRadiologyOrderDocument extends IRadiologyOrder, Document {}

const RadiologyOrderSchema = new Schema<IRadiologyOrderDocument>({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient',
    index: true
  },
  staffId: {
    type: String,
    required: true,
    ref: 'Staff',
    index: true
  },
  orderDate: {
    type: Date,
    required: true,
    index: true
  },
  studyType: {
    type: String,
    enum: ['xray', 'ct', 'mri', 'ultrasound', 'mammography', 'nuclear', 'pet', 'fluoroscopy'],
    required: true,
    index: true
  },
  bodyPart: {
    type: String,
    required: true,
    index: true
  },
  clinicalIndication: {
    type: String
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    required: true,
    index: true
  },
  contrastRequired: {
    type: Boolean,
    default: false
  },
  contrastType: {
    type: String
  },
  status: {
    type: String,
    enum: ['ordered', 'scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'ordered',
    index: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'radiology_orders'
});

// Indexes for performance
RadiologyOrderSchema.index({ patientId: 1, orderDate: -1 });
RadiologyOrderSchema.index({ staffId: 1, orderDate: -1 });
RadiologyOrderSchema.index({ studyType: 1, status: 1 });
RadiologyOrderSchema.index({ priority: 1, status: 1 });

export const RadiologyOrderModel = mongoose.model<IRadiologyOrderDocument>('RadiologyOrder', RadiologyOrderSchema);
