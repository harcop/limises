import { Response } from 'express';
import { BaseController } from '../../base/Controller';
import { BillingService } from '../services/BillingService';
import { AuthRequest } from '../../../types';

export class BillingController extends BaseController {
  private service: BillingService;

  constructor() {
    super('BillingController');
    this.service = new BillingService();
  }

  // Charge management routes
  createCharge = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const chargeData = req.body;
      const result = await this.service.createCharge(chargeData);
      this.sendSuccessResponse(res, result, 'Charge created successfully', 201);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to create charge', statusCode);
    }
  };

  getCharges = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filters = {
        patientId: req.query['patientId'] as string,
        accountId: req.query['accountId'] as string,
        serviceType: req.query['serviceType'] as string,
        status: req.query['status'] as string,
        startDate: req.query['startDate'] as string,
        endDate: req.query['endDate'] as string
      };

      const pagination = {
        page: parseInt(req.query['page'] as string) || 1,
        limit: parseInt(req.query['limit'] as string) || 20
      };

      const result = await this.service.getCharges(filters, pagination);
      res.json({
        success: true,
        message: 'Charges retrieved successfully',
        data: result.charges,
        pagination: result.pagination
      });
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve charges', statusCode);
    }
  };

  getCharge = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { chargeId } = req.params;
      if (!chargeId) {
        throw new Error('Charge ID is required');
      }
      const result = await this.service.getCharge(chargeId);
      this.sendSuccessResponse(res, result, 'Charge retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve charge', statusCode);
    }
  };

  // Payment management routes
  createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const paymentData = req.body;
      const result = await this.service.createPayment(paymentData);
      this.sendSuccessResponse(res, result, 'Payment created successfully', 201);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to create payment', statusCode);
    }
  };

  getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filters = {
        patientId: req.query['patientId'] as string,
        accountId: req.query['accountId'] as string,
        paymentMethod: req.query['paymentMethod'] as string,
        status: req.query['status'] as string,
        startDate: req.query['startDate'] as string,
        endDate: req.query['endDate'] as string
      };

      const pagination = {
        page: parseInt(req.query['page'] as string) || 1,
        limit: parseInt(req.query['limit'] as string) || 20
      };

      const result = await this.service.getPayments(filters, pagination);
      res.json({
        success: true,
        message: 'Payments retrieved successfully',
        data: result.payments,
        pagination: result.pagination
      });
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve payments', statusCode);
    }
  };

  // Billing account management routes
  createBillingAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const accountData = req.body;
      const result = await this.service.createBillingAccount(accountData);
      this.sendSuccessResponse(res, result, 'Billing account created successfully', 201);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to create billing account', statusCode);
    }
  };

  getBillingAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { accountId } = req.params;
      if (!accountId) {
        throw new Error('Account ID is required');
      }
      const result = await this.service.getBillingAccount(accountId);
      this.sendSuccessResponse(res, result, 'Billing account retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve billing account', statusCode);
    }
  };

  updateBillingAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { accountId } = req.params;
      if (!accountId) {
        throw new Error('Account ID is required');
      }
      const updateData = req.body;
      const result = await this.service.updateBillingAccount(accountId, updateData);
      this.sendSuccessResponse(res, result, 'Billing account updated successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to update billing account', statusCode);
    }
  };

  // Statistics
  getBillingStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filters = {
        startDate: req.query['startDate'] as string,
        endDate: req.query['endDate'] as string
      };

      const result = await this.service.getBillingStats(filters);
      this.sendSuccessResponse(res, result, 'Billing statistics retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve billing statistics', statusCode);
    }
  };
}
