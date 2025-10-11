import { Request, Response } from 'express';
import { BaseController } from '../../base/Controller';
import { PatientsService } from '../services/PatientsService';
import { AuthRequest } from '../../../types';

export class PatientsController extends BaseController {
  private service: PatientsService;

  constructor() {
    super('PatientsController');
    this.service = new PatientsService();
  }

  // @route   POST /api/patients
  // @desc    Register a new patient (staff-only)
  // @access  Private (Staff only)
  createPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const patientData = req.body;
      const result = await this.service.createPatient(patientData);
      this.sendSuccessResponse(res, result, 'Patient registered successfully', 201);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to register patient', statusCode);
    }
  };

  // @route   GET /api/patients
  // @desc    Get all patients with filters and pagination
  // @access  Private (Staff only)
  getPatients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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
      res.json({
        success: true,
        message: 'Patients retrieved successfully',
        data: result.patients,
        pagination: result.pagination
      });
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve patients', statusCode);
    }
  };

  // @route   GET /api/patients/:patientId
  // @desc    Get a specific patient by ID
  // @access  Private (Staff only)
  getPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      const patient = await this.service.getPatient(patientId);
      this.sendSuccessResponse(res, { patient }, 'Patient retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve patient', statusCode);
    }
  };

  // @route   PUT /api/patients/:patientId
  // @desc    Update patient information
  // @access  Private (Staff only)
  updatePatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      const updateData = req.body;
      const updatedPatient = await this.service.updatePatient(patientId, updateData);
      this.sendSuccessResponse(res, { patient: updatedPatient }, 'Patient updated successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to update patient', statusCode);
    }
  };

  // @route   DELETE /api/patients/:patientId
  // @desc    Deactivate a patient (soft delete)
  // @access  Private (Admin only)
  deactivatePatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      await this.service.deactivatePatient(patientId);
      this.sendSuccessResponse(res, null, 'Patient deactivated successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to deactivate patient', statusCode);
    }
  };

  // @route   GET /api/patients/:patientId/insurance
  // @desc    Get patient insurance information
  // @access  Private (Staff only)
  getPatientInsurance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      const insurance = await this.service.getPatientInsurance(patientId);
      this.sendSuccessResponse(res, insurance, 'Insurance information retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve insurance information', statusCode);
    }
  };

  // @route   POST /api/patients/:patientId/insurance
  // @desc    Add insurance information for a patient
  // @access  Private (Staff only)
  addPatientInsurance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      const insuranceData = req.body;
      const result = await this.service.addPatientInsurance(patientId, insuranceData);
      this.sendSuccessResponse(res, result, 'Insurance information added successfully', 201);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to add insurance information', statusCode);
    }
  };

  // @route   GET /api/patients/stats
  // @desc    Get patient statistics
  // @access  Private (Staff only)
  getPatientStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getPatientStats();
      this.sendSuccessResponse(res, stats, 'Patient statistics retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve patient statistics', statusCode);
    }
  };
}
