import { Request, Response } from 'express';
import { BaseController } from '../../base/Controller';
import { ClinicalService } from '../services/ClinicalService';
import { AuthRequest } from '../../../types';

export class ClinicalController extends BaseController {
  constructor() {
    super(new ClinicalService(), 'ClinicalController');
  }

  // Clinical note routes
  createClinicalNote = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const noteData = req.body;
    const result = await this.service.createClinicalNote(noteData);
    this.sendSuccess(res, { note: result }, 'Clinical note created successfully', 201);
  });

  getClinicalNotes = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      patientId: req.query.patientId as string,
      appointmentId: req.query.appointmentId as string,
      noteType: req.query.noteType as string,
      isSigned: req.query.isSigned === 'true' ? true : req.query.isSigned === 'false' ? false : undefined,
      status: req.query.status as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getClinicalNotes(filters, pagination);
    this.sendSuccess(res, result);
  });

  getClinicalNote = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { noteId } = req.params;
    const note = await this.service.getClinicalNote(noteId);
    this.sendSuccess(res, { note });
  });

  updateClinicalNote = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { noteId } = req.params;
      const updateData = req.body;
    const updatedNote = await this.service.updateClinicalNote(noteId, updateData);
    this.sendSuccess(res, { note: updatedNote }, 'Clinical note updated successfully');
  });

  signClinicalNote = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { noteId } = req.params;
    const signedBy = req.user?.staffId || 'unknown';
    const signedNote = await this.service.signClinicalNote(noteId, signedBy);
    this.sendSuccess(res, { note: signedNote }, 'Clinical note signed successfully');
  });

  // Prescription routes
  createPrescription = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const prescriptionData = req.body;
    const result = await this.service.createPrescription(prescriptionData);
    this.sendSuccess(res, { prescription: result }, 'Prescription created successfully', 201);
  });

  getPrescriptions = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      patientId: req.query.patientId as string,
      appointmentId: req.query.appointmentId as string,
      prescribedBy: req.query.prescribedBy as string,
      status: req.query.status as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getPrescriptions(filters, pagination);
    this.sendSuccess(res, result);
  });

  getPrescription = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { prescriptionId } = req.params;
    const prescription = await this.service.getPrescription(prescriptionId);
    this.sendSuccess(res, { prescription });
  });

  updatePrescription = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { prescriptionId } = req.params;
      const updateData = req.body;
    const updatedPrescription = await this.service.updatePrescription(prescriptionId, updateData);
    this.sendSuccess(res, { prescription: updatedPrescription }, 'Prescription updated successfully');
  });

  // Drug master routes
  getDrugs = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getDrugs(pagination);
    this.sendSuccess(res, result);
  });

  getDrug = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { drugId } = req.params;
    const drug = await this.service.getDrug(drugId);
    this.sendSuccess(res, { drug });
  });
}
