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
    try {
      const noteData = req.body;
      const result = await this.service.createClinicalNote(noteData);
      this.sendSuccessResponse(res, result, 'Clinical note created successfully', 201);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to create clinical note', statusCode);
    }
  };

  getClinicalNotes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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

      const result = await this.service.getClinicalNotes(filters, pagination);
      res.json({
        success: true,
        message: 'Clinical notes retrieved successfully',
        data: result.notes,
        pagination: result.pagination
      });
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve clinical notes', statusCode);
    }
  };

  getClinicalNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { noteId } = req.params;
      if (!noteId) {
        throw new Error('Note ID is required');
      }
      const result = await this.service.getClinicalNote(noteId);
      this.sendSuccessResponse(res, result, 'Clinical note retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve clinical note', statusCode);
    }
  };

  updateClinicalNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { noteId } = req.params;
      if (!noteId) {
        throw new Error('Note ID is required');
      }
      const updateData = req.body;
      const result = await this.service.updateClinicalNote(noteId, updateData);
      this.sendSuccessResponse(res, result, 'Clinical note updated successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to update clinical note', statusCode);
    }
  };

  signClinicalNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { noteId } = req.params;
      if (!noteId) {
        throw new Error('Note ID is required');
      }
      const signedBy = req.user?.staffId || 'unknown';
      const result = await this.service.signClinicalNote(noteId, signedBy);
      this.sendSuccessResponse(res, result, 'Clinical note signed successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to sign clinical note', statusCode);
    }
  };

  // Prescription routes
  createPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const prescriptionData = req.body;
      const result = await this.service.createPrescription(prescriptionData);
      this.sendSuccessResponse(res, result, 'Prescription created successfully', 201);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to create prescription', statusCode);
    }
  };

  getPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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

      const result = await this.service.getPrescriptions(filters, pagination);
      res.json({
        success: true,
        message: 'Prescriptions retrieved successfully',
        data: result.prescriptions,
        pagination: result.pagination
      });
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve prescriptions', statusCode);
    }
  };

  getPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { prescriptionId } = req.params;
      if (!prescriptionId) {
        throw new Error('Prescription ID is required');
      }
      const result = await this.service.getPrescription(prescriptionId);
      this.sendSuccessResponse(res, result, 'Prescription retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve prescription', statusCode);
    }
  };

  updatePrescription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { prescriptionId } = req.params;
      if (!prescriptionId) {
        throw new Error('Prescription ID is required');
      }
      const updateData = req.body;
      const result = await this.service.updatePrescription(prescriptionId, updateData);
      this.sendSuccessResponse(res, result, 'Prescription updated successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to update prescription', statusCode);
    }
  };

  // Drug master routes
  getDrugs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const pagination = {
        page: parseInt(req.query['page'] as string) || 1,
        limit: parseInt(req.query['limit'] as string) || 20
      };

      const result = await this.service.getDrugs(pagination);
      res.json({
        success: true,
        message: 'Drugs retrieved successfully',
        data: result.drugs,
        pagination: result.pagination
      });
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve drugs', statusCode);
    }
  };

  getDrug = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { drugId } = req.params;
      if (!drugId) {
        throw new Error('Drug ID is required');
      }
      const result = await this.service.getDrug(drugId);
      this.sendSuccessResponse(res, result, 'Drug retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve drug', statusCode);
    }
  };
}
