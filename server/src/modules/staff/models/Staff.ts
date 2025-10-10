import mongoose, { Schema, Document } from 'mongoose';
import { Staff } from '../interfaces';

export interface IStaff extends Staff, Document {}

const StaffSchema = new Schema<IStaff>({
  staffId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique identifier for the staff member'
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    description: 'Employee ID number assigned by HR'
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    description: 'Staff member's first name'
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    description: 'Staff member's last name'
  },
  middleName: {
    type: String,
    trim: true,
    description: 'Staff member's middle name (optional)'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    description: 'Staff member's work email address'
  },
  phone: {
    type: String,
    description: 'Staff member's primary phone number'
  },
  address: {
    type: String,
    description: 'Staff member's home address'
  },
  city: {
    type: String,
    description: 'Staff member's city of residence'
  },
  state: {
    type: String,
    description: 'Staff member's state or province'
  },
  zipCode: {
    type: String,
    description: 'Staff member's postal or ZIP code'
  },
  country: {
    type: String,
    default: 'USA',
    description: 'Staff member's country of residence'
  },
  department: {
    type: String,
    required: true,
    description: 'Department where the staff member works'
  },
  position: {
    type: String,
    required: true,
    description: 'Job title or position of the staff member'
  },
  hireDate: {
    type: String,
    required: true,
    description: 'Date when the staff member was hired'
  },
  terminationDate: {
    type: Date,
    description: 'Date when employment was terminated (if applicable)'
  },
  salary: {
    type: Number,
    description: 'Annual salary of the staff member'
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['full_time', 'part_time', 'contract', 'intern'],
    description: 'Type of employment arrangement'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on_leave'],
    default: 'active',
    description: 'Current employment status of the staff member'
  },
  photoUrl: {
    type: String,
    description: 'URL to staff member's profile photo'
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
    description: 'Relationship of emergency contact to staff member'
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
