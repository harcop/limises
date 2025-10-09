import mongoose, { Document, Schema } from 'mongoose';
import { IEmployeeRecord } from '../interfaces/IHumanResources';

export interface IEmployeeRecordDocument extends IEmployeeRecord, Document {}

const EmployeeRecordSchema = new Schema<IEmployeeRecordDocument>({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  staffId: {
    type: String,
    required: true,
    ref: 'Staff',
    unique: true,
    index: true
  },
  employeeNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  hireDate: {
    type: Date,
    required: true,
    index: true
  },
  terminationDate: {
    type: Date
  },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'intern', 'consultant'],
    required: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: true,
    index: true
  },
  department: {
    type: String,
    required: true,
    index: true
  },
  managerId: {
    type: String,
    ref: 'Staff'
  },
  salary: {
    type: Number,
    min: 0
  },
  benefits: {
    type: Schema.Types.Mixed // JSON object
  },
  emergencyContact: {
    type: Schema.Types.Mixed // JSON object
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on_leave'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  collection: 'employee_records'
});

// Indexes for performance
EmployeeRecordSchema.index({ department: 1, status: 1 });
EmployeeRecordSchema.index({ employmentType: 1, status: 1 });
EmployeeRecordSchema.index({ managerId: 1 });

export const EmployeeRecordModel = mongoose.model<IEmployeeRecordDocument>('EmployeeRecord', EmployeeRecordSchema);
