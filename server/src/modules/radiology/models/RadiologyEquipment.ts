import mongoose, { Document, Schema } from 'mongoose';
import { IRadiologyEquipment } from '../interfaces/IRadiology';

export interface IRadiologyEquipmentDocument extends IRadiologyEquipment, Document {}

const RadiologyEquipmentSchema = new Schema<IRadiologyEquipmentDocument>({
  equipmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  equipmentName: {
    type: String,
    required: true
  },
  equipmentType: {
    type: String,
    enum: ['xray', 'ct', 'mri', 'ultrasound', 'mammography', 'nuclear', 'pet', 'fluoroscopy'],
    required: true,
    index: true
  },
  manufacturer: {
    type: String
  },
  model: {
    type: String
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'out_of_service'],
    default: 'operational',
    index: true
  },
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'radiology_equipment'
});

// Indexes for performance
RadiologyEquipmentSchema.index({ equipmentType: 1, status: 1 });
RadiologyEquipmentSchema.index({ status: 1 });
RadiologyEquipmentSchema.index({ serialNumber: 1 });

export const RadiologyEquipmentModel = mongoose.model<IRadiologyEquipmentDocument>('RadiologyEquipment', RadiologyEquipmentSchema);
