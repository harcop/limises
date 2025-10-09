import { Response } from 'express';
import { BaseController } from '../../base/Controller';
import { BillingService } from '../services/BillingService';
import { AuthRequest } from '../../../types';

export class BillingController extends BaseController {
  constructor() {
    super(new BillingService(), 'BillingController');
  }

  // Charge management routes
  createCharge = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const chargeData = req.body;
    const result = await this.service.createCharge(chargeData);
    this.sendSuccess(res, { charge: result }, 'Charge created successfully', 201);
  });

  getCharges = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      patientId: req.query.patientId as string,
      accountId: req.query.accountId as string,
      serviceType: req.query.serviceType as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getCharges(filters, pagination);
    this.sendSuccess(res, result);
  });

  getCharge = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { chargeId } = req.params;
    const charge = await this.service.getCharge(chargeId);
    this.sendSuccess(res, { charge });
  });

  // Payment management routes
  createPayment = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const paymentData = req.body;
    const result = await this.service.createPayment(paymentData);
    this.sendSuccess(res, { payment: result }, 'Payment created successfully', 201);
  });

  getPayments = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      patientId: req.query.patientId as string,
      accountId: req.query.accountId as string,
      paymentMethod: req.query.paymentMethod as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getPayments(filters, pagination);
    this.sendSuccess(res, result);
  });

  // Billing account management routes
  createBillingAccount = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const accountData = req.body;
    const result = await this.service.createBillingAccount(accountData);
    this.sendSuccess(res, { account: result }, 'Billing account created successfully', 201);
  });

  getBillingAccount = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { accountId } = req.params;
    const account = await this.service.getBillingAccount(accountId);
    this.sendSuccess(res, { account });
  });

  updateBillingAccount = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { accountId } = req.params;
    const updateData = req.body;
    const updatedAccount = await this.service.updateBillingAccount(accountId, updateData);
    this.sendSuccess(res, { account: updatedAccount }, 'Billing account updated successfully');
  });

  // Statistics
  getBillingStats = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const stats = await this.service.getBillingStats(filters);
    this.sendSuccess(res, stats);
  });
}
