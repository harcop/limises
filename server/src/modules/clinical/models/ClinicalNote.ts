import mongoose, { Schema, Document } from 'mongoose';
import { ClinicalNote } from '../interfaces';

export interface IClinicalNote extends ClinicalNote, Document {}

const ClinicalNoteSchema = new Schema<IClinicalNote>({
  noteId: {
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
  appointmentId: {
    type: String,
    ref: 'Appointment'
  },
  admissionId: {
    type: String,
    ref: 'IPDAdmission'
  },
  noteType: {
    type: String,
    required: true,
    enum: ['consultation', 'progress', 'discharge', 'procedure', 'emergency']
  },
  chiefComplaint: {
    type: String
  },
  historyOfPresentIllness: {
    type: String
  },
  physicalExamination: {
    type: String
  },
  assessment: {
    type: String
  },
  plan: {
    type: String
  },
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number
  },
  isSigned: {
    type: Boolean,
    default: false
  },
  signedBy: {
    type: String,
    ref: 'Staff'
  },
  signedAt: {
    type: Date
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'clinical_notes'
});

// Indexes for better performance
ClinicalNoteSchema.index({ patientId: 1 });
ClinicalNoteSchema.index({ staffId: 1 });
ClinicalNoteSchema.index({ appointmentId: 1 });
ClinicalNoteSchema.index({ admissionId: 1 });
ClinicalNoteSchema.index({ noteType: 1 });
ClinicalNoteSchema.index({ isSigned: 1 });
ClinicalNoteSchema.index({ createdAt: -1 });

export const ClinicalNoteModel = mongoose.model<IClinicalNote>('ClinicalNote', ClinicalNoteSchema);
