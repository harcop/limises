import { Response } from 'express';
import { BaseController } from '../../base/Controller';
import { ClinicalService } from '../services/ClinicalService';
import { AuthRequest } from '../../../types';

export class ClinicalController extends BaseController {
  private service: ClinicalService;

  constructor() {
    super('ClinicalController');
    this.service = new ClinicalService();
  }

  // Clinical note routes
  createClinicalNote = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const noteData = req.body;
        return await this.service.createClinicalNote(noteData);
      },
      'Clinical note created successfully',
      'Failed to create clinical note',
      201
    );
  };

  getClinicalNotes = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handlePaginatedOperation(
      res,
      async () => {
        const filters = {
          patientId: req.query['patientId'] as string,
          appointmentId: req.query['appointmentId'] as string,
          noteType: req.query['noteType'] as string,
          isSigned: req.query['isSigned'] === 'true' ? true : req.query['isSigned'] === 'false' ? false : undefined,
          status: req.query['status'] as string
        };

        const pagination = {
          page: parseInt(req.query['page'] as string) || 1,
          limit: parseInt(req.query['limit'] as string) || 20
        };

        return await this.service.getClinicalNotes(filters, pagination);
      },
      'Clinical notes retrieved successfully'
    );
  };

  getClinicalNote = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { noteId } = req.params;
        if (!noteId) {
          throw new Error('Note ID is required');
        }
        return await this.service.getClinicalNote(noteId);
      },
      'Clinical note retrieved successfully',
      'Failed to retrieve clinical note'
    );
  };

  updateClinicalNote = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { noteId } = req.params;
        if (!noteId) {
          throw new Error('Note ID is required');
        }
        const updateData = req.body;
        return await this.service.updateClinicalNote(noteId, updateData);
      },
      'Clinical note updated successfully',
      'Failed to update clinical note'
    );
  };

  signClinicalNote = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { noteId } = req.params;
        if (!noteId) {
          throw new Error('Note ID is required');
        }
        const signedBy = req.user?.staffId || 'unknown';
        return await this.service.signClinicalNote(noteId, signedBy);
      },
      'Clinical note signed successfully',
      'Failed to sign clinical note'
    );
  };

  // Prescription routes
  createPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const prescriptionData = req.body;
        return await this.service.createPrescription(prescriptionData);
      },
      'Prescription created successfully',
      'Failed to create prescription',
      201
    );
  };

  getPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handlePaginatedOperation(
      res,
      async () => {
        const filters = {
          patientId: req.query['patientId'] as string,
          appointmentId: req.query['appointmentId'] as string,
          prescribedBy: req.query['prescribedBy'] as string,
          status: req.query['status'] as string
        };

        const pagination = {
          page: parseInt(req.query['page'] as string) || 1,
          limit: parseInt(req.query['limit'] as string) || 20
        };

        return await this.service.getPrescriptions(filters, pagination);
      },
      'Prescriptions retrieved successfully'
    );
  };

  getPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { prescriptionId } = req.params;
        if (!prescriptionId) {
          throw new Error('Prescription ID is required');
        }
        return await this.service.getPrescription(prescriptionId);
      },
      'Prescription retrieved successfully',
      'Failed to retrieve prescription'
    );
  };

  updatePrescription = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { prescriptionId } = req.params;
        if (!prescriptionId) {
          throw new Error('Prescription ID is required');
        }
        const updateData = req.body;
        return await this.service.updatePrescription(prescriptionId, updateData);
      },
      'Prescription updated successfully',
      'Failed to update prescription'
    );
  };

  // Drug master routes
  getDrugs = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handlePaginatedOperation(
      res,
      async () => {
        const pagination = {
          page: parseInt(req.query['page'] as string) || 1,
          limit: parseInt(req.query['limit'] as string) || 20
        };

        return await this.service.getDrugs(pagination);
      },
      'Drugs retrieved successfully'
    );
  };

  getDrug = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { drugId } = req.params;
        if (!drugId) {
          throw new Error('Drug ID is required');
        }
        return await this.service.getDrug(drugId);
      },
      'Drug retrieved successfully',
      'Failed to retrieve drug'
    );
  };
}
