import mongoose, { Schema, Document } from 'mongoose';
import { Patient } from '../interfaces';

export interface IPatient extends Patient, Document {}

const PatientSchema = new Schema<IPatient>({
  patientId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  zipCode: {
    type: String
  },
  country: {
    type: String,
    default: 'USA'
  },
  emergencyContactName: {
    type: String
  },
  emergencyContactPhone: {
    type: String
  },
  emergencyContactRelationship: {
    type: String
  },
  bloodType: {
    type: String
  },
  allergies: {
    type: String
  },
  medicalConditions: {
    type: String
  },
  photoUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'patients'
});

// Indexes for better performance
PatientSchema.index({ firstName: 1, lastName: 1 });
PatientSchema.index({ phone: 1 });
PatientSchema.index({ email: 1 });
PatientSchema.index({ status: 1 });
PatientSchema.index({ createdAt: -1 });

// Virtual for full name
PatientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
PatientSchema.set('toJSON', {
  virtuals: true
});

export const PatientModel = mongoose.model<IPatient>('Patient', PatientSchema);
