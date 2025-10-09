import mongoose, { Document, Schema } from 'mongoose';
import { IOperationTheatre } from '../interfaces/IOperationTheatre';

export interface IOperationTheatreDocument extends IOperationTheatre, Document {}

const OperationTheatreSchema = new Schema<IOperationTheatreDocument>({
  theatreId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  theatreName: {
    type: String,
    required: true,
    unique: true
  },
  theatreNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  equipmentList: {
    type: Schema.Types.Mixed // JSON object
  },
  specializations: {
    type: Schema.Types.Mixed // JSON object
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'cleaning'],
    default: 'available',
    index: true
  },
  location: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'operation_theatres'
});

// Indexes for performance
OperationTheatreSchema.index({ status: 1 });
OperationTheatreSchema.index({ theatreNumber: 1 });

export const OperationTheatreModel = mongoose.model<IOperationTheatreDocument>('OperationTheatre', OperationTheatreSchema);
