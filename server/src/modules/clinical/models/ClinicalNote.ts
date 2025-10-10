import mongoose, { Schema, Document } from 'mongoose';
import { ClinicalNote } from '../interfaces';

export interface IClinicalNote extends ClinicalNote, Document {}

const ClinicalNoteSchema = new Schema<IClinicalNote>({
  noteId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique identifier for the clinical note'
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient',
    description: 'Reference to the patient this note belongs to'
  },
  staffId: {
    type: String,
    required: true,
    ref: 'Staff',
    description: 'Reference to the healthcare provider who wrote the note'
  },
  appointmentId: {
    type: String,
    ref: 'Appointment',
    description: 'Reference to the appointment (if note is from an appointment)'
  },
  admissionId: {
    type: String,
    ref: 'IPDAdmission',
    description: 'Reference to the admission (if note is from an inpatient stay)'
  },
  noteType: {
    type: String,
    required: true,
    enum: ['consultation', 'progress', 'discharge', 'procedure', 'emergency'],
    description: 'Type of clinical note'
  },
  chiefComplaint: {
    type: String,
    description: 'Primary reason for the patient visit'
  },
  historyOfPresentIllness: {
    type: String,
    description: 'Detailed history of the current illness or condition'
  },
  physicalExamination: {
    type: String,
    description: 'Findings from the physical examination'
  },
  assessment: {
    type: String,
    description: 'Clinical assessment and diagnosis'
  },
  plan: {
    type: String,
    description: 'Treatment plan and follow-up instructions'
  },
  vitalSigns: {
    bloodPressure: {
      type: String,
      description: 'Blood pressure reading (e.g., 120/80)'
    },
    heartRate: {
      type: Number,
      description: 'Heart rate in beats per minute'
    },
    temperature: {
      type: Number,
      description: 'Body temperature in degrees'
    },
    respiratoryRate: {
      type: Number,
      description: 'Respiratory rate in breaths per minute'
    },
    oxygenSaturation: {
      type: Number,
      description: 'Oxygen saturation percentage'
    },
    weight: {
      type: Number,
      description: 'Patient weight in appropriate units'
    },
    height: {
      type: Number,
      description: 'Patient height in appropriate units'
    }
  },
  isSigned: {
    type: Boolean,
    default: false,
    description: 'Whether the note has been electronically signed'
  },
  signedBy: {
    type: String,
    ref: 'Staff',
    description: 'Staff member who signed the note'
  },
  signedAt: {
    type: Date,
    description: 'Date and time when the note was signed'
  },
  attachments: [{
    fileName: {
      type: String,
      description: 'Name of the attached file'
    },
    fileUrl: {
      type: String,
      description: 'URL or path to the attached file'
    },
    fileType: {
      type: String,
      description: 'Type of the attached file (e.g., image, document)'
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      description: 'Date and time when the file was uploaded'
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
