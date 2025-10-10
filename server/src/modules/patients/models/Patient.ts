import mongoose, { Schema, Document } from 'mongoose';
import { Patient } from '../interfaces';

export interface IPatient extends Patient, Document {}

const PatientSchema = new Schema<IPatient>({
  patientId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique identifier for the patient'
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    description: 'Patient\'s first name'
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    description: 'Patient\'s last name'
  },
  middleName: {
    type: String,
    trim: true,
    description: 'Patient\'s middle name (optional)'
  },
  dateOfBirth: {
    type: Date,
    required: true,
    description: 'Patient\'s date of birth'
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
    description: 'Patient\'s gender identity'
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    description: 'Patient\'s primary phone number'
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    description: 'Patient\'s email address'
  },
  address: {
    type: String,
    description: 'Patient\'s street address'
  },
  city: {
    type: String,
    description: 'Patient\'s city of residence'
  },
  state: {
    type: String,
    description: 'Patient\'s state or province'
  },
  zipCode: {
    type: String,
    description: 'Patient\'s postal or ZIP code'
  },
  country: {
    type: String,
    default: 'USA',
    description: 'Patient\'s country of residence'
  },
  emergencyContactName: {
    type: String,
    description: 'Name of emergency contact person'
  },
  emergencyContactPhone: {
    type: String,
    description: 'Phone number of emergency contact'
  },
  emergencyContactRelationship: {
    type: String,
    description: 'Relationship of emergency contact to patient'
  },
  bloodType: {
    type: String,
    description: 'Patient\'s blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)'
  },
  allergies: {
    type: String,
    description: 'Known allergies and adverse reactions'
  },
  medicalConditions: {
    type: String,
    description: 'Chronic medical conditions and health history'
  },
  photoUrl: {
    type: String,
    description: 'URL to patient\'s profile photo'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased'],
    default: 'active',
    description: 'Current status of the patient record'
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
