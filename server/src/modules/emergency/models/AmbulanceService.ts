import mongoose, { Document, Schema } from 'mongoose';
import { IAmbulanceService } from '../interfaces/IEmergency';

export interface IAmbulanceServiceDocument extends IAmbulanceService, Document {}

const AmbulanceServiceSchema = new Schema<IAmbulanceServiceDocument>({
  serviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ambulanceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  driverName: {
    type: String,
    required: true
  },
  driverLicense: {
    type: String
  },
  paramedicName: {
    type: String
  },
  paramedicLicense: {
    type: String
  },
  vehicleType: {
    type: String,
    enum: ['basic', 'advanced', 'critical_care'],
    required: true,
    index: true
  },
  equipmentList: {
    type: Schema.Types.Mixed // JSON object
  },
  status: {
    type: String,
    enum: ['available', 'on_call', 'maintenance', 'out_of_service'],
    default: 'available',
    index: true
  },
  location: {
    type: String
  },
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'ambulance_services'
});

// Indexes for performance
AmbulanceServiceSchema.index({ status: 1, vehicleType: 1 });
AmbulanceServiceSchema.index({ ambulanceNumber: 1 });

export const AmbulanceServiceModel = mongoose.model<IAmbulanceServiceDocument>('AmbulanceService', AmbulanceServiceSchema);
