import mongoose, { Schema, Document } from 'mongoose';
import { Appointment } from '../interfaces';

export interface IAppointment extends Appointment, Document {}

const AppointmentSchema = new Schema<IAppointment>({
  appointmentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique identifier for the appointment'
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient',
    description: 'Reference to the patient for this appointment'
  },
  staffId: {
    type: String,
    required: true,
    ref: 'Staff',
    description: 'Reference to the healthcare provider for this appointment'
  },
  appointmentDate: {
    type: Date,
    required: true,
    description: 'Date of the appointment'
  },
  appointmentTime: {
    type: String,
    required: true,
    description: 'Time of the appointment (HH:MM format)'
  },
  appointmentType: {
    type: String,
    required: true,
    enum: ['consultation', 'follow_up', 'procedure', 'emergency'],
    description: 'Type of appointment'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled',
    description: 'Current status of the appointment'
  },
  duration: {
    type: Number,
    default: 30,
    description: 'Duration of the appointment in minutes'
  },
  notes: {
    type: String,
    description: 'Additional notes about the appointment'
  },
  roomNumber: {
    type: String,
    description: 'Room number where the appointment will take place'
  },
  reason: {
    type: String,
    description: 'Reason for the appointment or chief complaint'
  },
  followUpRequired: {
    type: Boolean,
    default: false,
    description: 'Whether a follow-up appointment is required'
  },
  followUpDate: {
    type: Date,
    description: 'Suggested date for follow-up appointment'
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
