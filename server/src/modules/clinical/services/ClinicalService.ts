import { BaseService } from '../../base/Service';
import { ClinicalNoteModel, PrescriptionModel, DrugMasterModel } from '../../../models';

export interface CreateClinicalNoteDto {
  patientId: string;
  appointmentId?: string;
  noteType: string;
  title: string;
  content: string;
  diagnosis?: string[];
  treatment?: string;
  followUpInstructions?: string;
  isSigned?: boolean;
  signedBy?: string;
  signedAt?: string;
}

export interface UpdateClinicalNoteDto {
  title?: string;
  content?: string;
  diagnosis?: string[];
  treatment?: string;
  followUpInstructions?: string;
  isSigned?: boolean;
  signedBy?: string;
  signedAt?: string;
}

export interface CreatePrescriptionDto {
  patientId: string;
  appointmentId?: string;
  prescriptionDate: string;
  medications: Array<{
    drugId: string;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity?: number;
  }>;
  notes?: string;
  prescribedBy: string;
}

export interface UpdatePrescriptionDto {
  prescriptionDate?: string;
  medications?: Array<{
    drugId: string;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity?: number;
  }>;
  notes?: string;
  status?: string;
}

export interface ClinicalFiltersDto {
  patientId?: string;
  appointmentId?: string;
  noteType?: string;
  isSigned?: boolean;
  prescribedBy?: string;
  status?: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
}

export class ClinicalService extends BaseService {
  constructor() {
    super('ClinicalService');
  }

  // Clinical Notes
  async createClinicalNote(noteData: CreateClinicalNoteDto): Promise<any> {
    try {
      const noteId = `CN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const clinicalNote = new ClinicalNoteModel({
        noteId,
        patientId: noteData.patientId,
        appointmentId: noteData.appointmentId,
        noteType: noteData.noteType,
        title: noteData.title,
        content: noteData.content,
        diagnosis: noteData.diagnosis || [],
        treatment: noteData.treatment,
        followUpInstructions: noteData.followUpInstructions,
        isSigned: noteData.isSigned || false,
        signedBy: noteData.signedBy,
        signedAt: noteData.signedAt,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      await clinicalNote.save();
      this.log('info', `Clinical note created: ${noteId}`);
      return clinicalNote;
    } catch (error) {
      this.handleError(error, 'Create clinical note');
    }
  }

  async getClinicalNotes(filters: ClinicalFiltersDto, pagination: PaginationDto): Promise<{ notes: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (filters.patientId) filter.patientId = filters.patientId;
      if (filters.appointmentId) filter.appointmentId = filters.appointmentId;
      if (filters.noteType) filter.noteType = filters.noteType;
      if (filters.isSigned !== undefined) filter.isSigned = filters.isSigned;
      if (filters.status) filter.status = filters.status;

      const total = await ClinicalNoteModel.countDocuments(filter);
      const notes = await ClinicalNoteModel.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        notes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get clinical notes');
    }
  }

  async getClinicalNote(noteId: string): Promise<any> {
    try {
      const note = await ClinicalNoteModel.findOne({ noteId }).select('-__v');
      if (!note) {
        throw new Error('Clinical note not found');
      }
      return note;
    } catch (error) {
      this.handleError(error, 'Get clinical note');
    }
  }

  async updateClinicalNote(noteId: string, updateData: UpdateClinicalNoteDto): Promise<any> {
    try {
      const updatedNote = await ClinicalNoteModel.findOneAndUpdate(
        { noteId },
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      if (!updatedNote) {
        throw new Error('Clinical note not found');
      }

      this.log('info', `Clinical note updated: ${noteId}`);
      return updatedNote;
    } catch (error) {
      this.handleError(error, 'Update clinical note');
    }
  }

  async signClinicalNote(noteId: string, signedBy: string): Promise<any> {
    try {
      const updatedNote = await ClinicalNoteModel.findOneAndUpdate(
        { noteId },
        { 
          isSigned: true,
          signedBy,
          signedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { new: true }
      ).select('-__v');

      if (!updatedNote) {
        throw new Error('Clinical note not found');
      }

      this.log('info', `Clinical note signed: ${noteId} by ${signedBy}`);
      return updatedNote;
    } catch (error) {
      this.handleError(error, 'Sign clinical note');
    }
  }

  // Prescriptions
  async createPrescription(prescriptionData: CreatePrescriptionDto): Promise<any> {
    try {
      const prescriptionId = `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const prescription = new PrescriptionModel({
        prescriptionId,
        patientId: prescriptionData.patientId,
        appointmentId: prescriptionData.appointmentId,
        prescriptionDate: prescriptionData.prescriptionDate,
        medications: prescriptionData.medications,
        notes: prescriptionData.notes,
        prescribedBy: prescriptionData.prescribedBy,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      await prescription.save();
      this.log('info', `Prescription created: ${prescriptionId}`);
      return prescription;
    } catch (error) {
      this.handleError(error, 'Create prescription');
    }
  }

  async getPrescriptions(filters: ClinicalFiltersDto, pagination: PaginationDto): Promise<{ prescriptions: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (filters.patientId) filter.patientId = filters.patientId;
      if (filters.appointmentId) filter.appointmentId = filters.appointmentId;
      if (filters.prescribedBy) filter.prescribedBy = filters.prescribedBy;
      if (filters.status) filter.status = filters.status;

      const total = await PrescriptionModel.countDocuments(filter);
      const prescriptions = await PrescriptionModel.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        prescriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get prescriptions');
    }
  }

  async getPrescription(prescriptionId: string): Promise<any> {
    try {
      const prescription = await PrescriptionModel.findOne({ prescriptionId }).select('-__v');
      if (!prescription) {
        throw new Error('Prescription not found');
      }
      return prescription;
    } catch (error) {
      this.handleError(error, 'Get prescription');
    }
  }

  async updatePrescription(prescriptionId: string, updateData: UpdatePrescriptionDto): Promise<any> {
    try {
      const updatedPrescription = await PrescriptionModel.findOneAndUpdate(
        { prescriptionId },
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      if (!updatedPrescription) {
        throw new Error('Prescription not found');
      }

      this.log('info', `Prescription updated: ${prescriptionId}`);
      return updatedPrescription;
    } catch (error) {
      this.handleError(error, 'Update prescription');
    }
  }

  // Drug Master
  async getDrugs(pagination: PaginationDto): Promise<{ drugs: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const total = await DrugMasterModel.countDocuments();
      const drugs = await DrugMasterModel.find()
        .select('-__v')
        .sort({ drugName: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        drugs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get drugs');
    }
  }

  async getDrug(drugId: string): Promise<any> {
    try {
      const drug = await DrugMasterModel.findOne({ drugId }).select('-__v');
      if (!drug) {
        throw new Error('Drug not found');
      }
      return drug;
    } catch (error) {
      this.handleError(error, 'Get drug');
    }
  }
}
