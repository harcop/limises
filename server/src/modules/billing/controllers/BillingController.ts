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
    await this.handleAsyncOperation(
      res,
      async () => {
        const chargeData = req.body;
        return await this.service.createCharge(chargeData);
      },
      'Charge created successfully',
      'Failed to create charge',
      201
    );
  };

  getCharges = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handlePaginatedOperation(
      res,
      async () => {
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
        return {
          data: result.charges,
          pagination: result.pagination
        };
      },
      'Charges retrieved successfully'
    );
  };

  getCharge = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { chargeId } = req.params;
        if (!chargeId) {
          throw new Error('Charge ID is required');
        }
        return await this.service.getCharge(chargeId);
      },
      'Charge retrieved successfully',
      'Failed to retrieve charge'
    );
  };

  // Payment management routes
  createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const paymentData = req.body;
        return await this.service.createPayment(paymentData);
      },
      'Payment created successfully',
      'Failed to create payment',
      201
    );
  };

  getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handlePaginatedOperation(
      res,
      async () => {
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
        return {
          data: result.payments,
          pagination: result.pagination
        };
      },
      'Payments retrieved successfully'
    );
  };

  // Billing account management routes
  createBillingAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const accountData = req.body;
        return await this.service.createBillingAccount(accountData);
      },
      'Billing account created successfully',
      'Failed to create billing account',
      201
    );
  };

  getBillingAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { accountId } = req.params;
        if (!accountId) {
          throw new Error('Account ID is required');
        }
        return await this.service.getBillingAccount(accountId);
      },
      'Billing account retrieved successfully',
      'Failed to retrieve billing account'
    );
  };

  updateBillingAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { accountId } = req.params;
        if (!accountId) {
          throw new Error('Account ID is required');
        }
        const updateData = req.body;
        return await this.service.updateBillingAccount(accountId, updateData);
      },
      'Billing account updated successfully',
      'Failed to update billing account'
    );
  };

  // Statistics
  getBillingStats = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const filters = {
          startDate: req.query['startDate'] as string,
          endDate: req.query['endDate'] as string
        };

        return await this.service.getBillingStats(filters);
      },
      'Billing statistics retrieved successfully',
      'Failed to retrieve billing statistics'
    );
  };
}
