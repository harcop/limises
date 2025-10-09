import mongoose, { Document, Schema } from 'mongoose';
import { IOTTeamAssignment } from '../interfaces/IOperationTheatre';

export interface IOTTeamAssignmentDocument extends IOTTeamAssignment, Document {}

const OTTeamAssignmentSchema = new Schema<IOTTeamAssignmentDocument>({
  assignmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  scheduleId: {
    type: String,
    required: true,
    ref: 'OTSchedule',
    index: true
  },
  staffId: {
    type: String,
    required: true,
    ref: 'Staff',
    index: true
  },
  role: {
    type: String,
    enum: ['surgeon', 'assistant', 'anesthetist', 'nurse', 'technician', 'observer'],
    required: true,
    index: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'ot_team_assignments'
});

// Indexes for performance
OTTeamAssignmentSchema.index({ scheduleId: 1, role: 1 });
OTTeamAssignmentSchema.index({ staffId: 1 });

export const OTTeamAssignmentModel = mongoose.model<IOTTeamAssignmentDocument>('OTTeamAssignment', OTTeamAssignmentSchema);
