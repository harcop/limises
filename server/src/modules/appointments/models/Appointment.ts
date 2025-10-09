import mongoose, { Schema, Document } from 'mongoose';
import { Appointment } from '../types';

export interface IAppointment extends Appointment, Document {}

const AppointmentSchema = new Schema<IAppointment>({
  appointmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  staffId: {
    type: String,
    required: true,
    ref: 'Staff'
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  appointmentType: {
    type: String,
    required: true,
    enum: ['consultation', 'follow_up', 'procedure', 'emergency']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  notes: {
    type: String
  },
  roomNumber: {
    type: String
  },
  reason: {
    type: String
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'appointments'
});

// Indexes for better performance
AppointmentSchema.index({ patientId: 1 });
AppointmentSchema.index({ staffId: 1 });
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentType: 1 });
AppointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

export const AppointmentModel = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
