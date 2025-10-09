import { Request, Response } from 'express';
import { BaseController } from '../../base/Controller';
import { PatientsService } from '../services/PatientsService';
import { AuthRequest } from '../../../types';

export class PatientsController extends BaseController {
  constructor() {
    super(new PatientsService(), 'PatientsController');
  }

  // @route   POST /api/patients
  // @desc    Register a new patient (staff-only)
  // @access  Private (Staff only)
  createPatient = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const patientData = req.body;
    const result = await this.service.createPatient(patientData);
    this.sendSuccess(res, result, 'Patient registered successfully', 201);
  });

  // @route   GET /api/patients
  // @desc    Get all patients with filters and pagination
  // @access  Private (Staff only)
  getPatients = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      gender: req.query.gender as string,
      bloodType: req.query.bloodType as string,
      city: req.query.city as string,
      state: req.query.state as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getPatients(filters, pagination);
    this.sendSuccess(res, result);
  });

  // @route   GET /api/patients/:patientId
  // @desc    Get a specific patient by ID
  // @access  Private (Staff only)
  getPatient = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { patientId } = req.params;
    const patient = await this.service.getPatient(patientId);
    this.sendSuccess(res, { patient });
  });

  // @route   PUT /api/patients/:patientId
  // @desc    Update patient information
  // @access  Private (Staff only)
  updatePatient = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { patientId } = req.params;
    const updateData = req.body;
    const updatedPatient = await this.service.updatePatient(patientId, updateData);
    this.sendSuccess(res, { patient: updatedPatient }, 'Patient updated successfully');
  });

  // @route   DELETE /api/patients/:patientId
  // @desc    Deactivate a patient (soft delete)
  // @access  Private (Admin only)
  deactivatePatient = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { patientId } = req.params;
    await this.service.deactivatePatient(patientId);
    this.sendSuccess(res, null, 'Patient deactivated successfully');
  });

  // @route   GET /api/patients/:patientId/insurance
  // @desc    Get patient insurance information
  // @access  Private (Staff only)
  getPatientInsurance = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { patientId } = req.params;
    const insurance = await this.service.getPatientInsurance(patientId);
    this.sendSuccess(res, insurance);
  });

  // @route   POST /api/patients/:patientId/insurance
  // @desc    Add insurance information for a patient
  // @access  Private (Staff only)
  addPatientInsurance = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { patientId } = req.params;
    const insuranceData = req.body;
    const result = await this.service.addPatientInsurance(patientId, insuranceData);
    this.sendSuccess(res, result, 'Insurance information added successfully', 201);
  });

  // @route   GET /api/patients/stats
  // @desc    Get patient statistics
  // @access  Private (Staff only)
  getPatientStats = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const stats = await this.service.getPatientStats();
    this.sendSuccess(res, stats);
  });
}
