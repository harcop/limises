// ==============================================
// CLINICAL MANAGEMENT INTERFACES
// ==============================================

export interface ClinicalNote {
  noteId: string;
  patientId: string;
  staffId: string;
  appointmentId?: string;
  admissionId?: string;
  noteType: 'consultation' | 'progress' | 'discharge' | 'procedure' | 'emergency';
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  assessment?: string;
  plan?: string;
  isSigned: boolean;
  signedBy?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Prescription {
  prescriptionId: string;
  patientId: string;
  staffId: string;
  drugId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refillsAllowed: number;
  refillsUsed: number;
  instructions?: string;
  prescribedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Request Types
export interface CreateClinicalNoteRequest {
  patientId: string;
  staffId: string;
  appointmentId?: string;
  admissionId?: string;
  noteType: 'consultation' | 'progress' | 'discharge' | 'procedure' | 'emergency';
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  assessment?: string;
  plan?: string;
}

export interface CreatePrescriptionRequest {
  patientId: string;
  staffId: string;
  drugId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refillsAllowed?: number;
  instructions?: string;
}
