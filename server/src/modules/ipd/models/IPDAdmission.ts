import mongoose, { Document, Schema } from 'mongoose';
import { IIPDAdmission } from '../interfaces/IIPD';

export interface IIPDAdmissionDocument extends IIPDAdmission, Document {}

const IPDAdmissionSchema = new Schema<IIPDAdmissionDocument>({
  admissionId: {
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
  wardId: {
    type: String,
    required: true,
    ref: 'Ward',
    index: true
  },
  bedId: {
    type: String,
    required: true,
    ref: 'Bed',
    index: true
  },
  admissionDate: {
    type: Date,
    required: true,
    index: true
  },
  admissionTime: {
    type: String,
    required: true
  },
  dischargeDate: {
    type: Date,
    index: true
  },
  dischargeTime: {
    type: String
  },
  admissionType: {
    type: String,
    enum: ['emergency', 'elective', 'transfer'],
    required: true,
    index: true
  },
  diagnosis: {
    type: String
  },
  status: {
    type: String,
    enum: ['admitted', 'discharged', 'transferred'],
    default: 'admitted',
    index: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'ipd_admissions'
});

// Indexes for performance
IPDAdmissionSchema.index({ patientId: 1, admissionDate: -1 });
IPDAdmissionSchema.index({ wardId: 1, status: 1 });
IPDAdmissionSchema.index({ bedId: 1, status: 1 });
IPDAdmissionSchema.index({ status: 1, admissionDate: -1 });

export const IPDAdmissionModel = mongoose.model<IIPDAdmissionDocument>('IPDAdmission', IPDAdmissionSchema);
