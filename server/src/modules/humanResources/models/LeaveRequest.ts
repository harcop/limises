import mongoose, { Document, Schema } from 'mongoose';
import { ILeaveRequest } from '../interfaces/IHumanResources';

export interface ILeaveRequestDocument extends ILeaveRequest, Document {}

const LeaveRequestSchema = new Schema<ILeaveRequestDocument>({
  leaveId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    ref: 'EmployeeRecord',
    index: true
  },
  leaveType: {
    type: String,
    enum: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'bereavement', 'other'],
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  daysRequested: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  approvedBy: {
    type: String,
    ref: 'Staff'
  },
  approvedAt: {
    type: Date
  },
  comments: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'leave_requests'
});

// Indexes for performance
LeaveRequestSchema.index({ employeeId: 1, startDate: -1 });
LeaveRequestSchema.index({ status: 1, startDate: -1 });
LeaveRequestSchema.index({ leaveType: 1, status: 1 });

export const LeaveRequestModel = mongoose.model<ILeaveRequestDocument>('LeaveRequest', LeaveRequestSchema);
