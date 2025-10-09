import mongoose, { Schema, Document } from 'mongoose';
import { Staff } from '../interfaces';

export interface IStaff extends Staff, Document {}

const StaffSchema = new Schema<IStaff>({
  staffId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
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
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
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
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  hireDate: {
    type: String,
    required: true
  },
  terminationDate: {
    type: Date
  },
  salary: {
    type: Number
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['full_time', 'part_time', 'contract', 'intern']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on_leave'],
    default: 'active'
  },
  photoUrl: {
    type: String
  },
  emergencyContactName: {
    type: String
  },
  emergencyContactPhone: {
    type: String
  },
  emergencyContactRelationship: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'staff'
});

// Indexes for better performance
StaffSchema.index({ firstName: 1, lastName: 1 });
StaffSchema.index({ email: 1 });
StaffSchema.index({ employeeId: 1 });
StaffSchema.index({ department: 1 });
StaffSchema.index({ position: 1 });
StaffSchema.index({ status: 1 });

// Virtual for full name
StaffSchema.virtual('fullName').get(function(this: IStaff) {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
StaffSchema.set('toJSON', {
  virtuals: true
});

export const StaffModel = mongoose.model<IStaff>('Staff', StaffSchema);
