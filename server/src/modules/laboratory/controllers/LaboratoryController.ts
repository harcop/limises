import { Response } from 'express';
import { BaseController } from '../../base/Controller';
import { LaboratoryService } from '../services/LaboratoryService';
import { AuthRequest } from '../../../types';

export class LaboratoryController extends BaseController {
  constructor() {
    super(new LaboratoryService(), 'LaboratoryController');
  }

  // Lab order routes
  createLabOrder = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const orderData = req.body;
    const result = await this.service.createLabOrder(orderData);
    this.sendSuccess(res, { order: result }, 'Lab order created successfully', 201);
  });

  getLabOrders = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      patientId: req.query.patientId as string,
      staffId: req.query.staffId as string,
      status: req.query.status as string,
      priority: req.query.priority as string,
      testType: req.query.testType as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getLabOrders(filters, pagination);
    this.sendSuccess(res, result);
  });

  getLabOrder = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const order = await this.service.getLabOrder(orderId);
    this.sendSuccess(res, { order });
  });

  updateLabOrder = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const updateData = req.body;
    const updatedOrder = await this.service.updateLabOrder(orderId, updateData);
    this.sendSuccess(res, { order: updatedOrder }, 'Lab order updated successfully');
  });

  // Lab sample routes
  createLabSample = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const sampleData = req.body;
    const result = await this.service.createLabSample(sampleData);
    this.sendSuccess(res, { sample: result }, 'Lab sample created successfully', 201);
  });

  getLabSamples = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      orderId: req.query.orderId as string,
      sampleType: req.query.sampleType as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getLabSamples(filters, pagination);
    this.sendSuccess(res, result);
  });

  // Lab result routes
  createLabResult = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const resultData = req.body;
    const result = await this.service.createLabResult(resultData);
    this.sendSuccess(res, { result }, 'Lab result created successfully', 201);
  });

  getLabResults = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      orderId: req.query.orderId as string,
      patientId: req.query.patientId as string,
      testName: req.query.testName as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getLabResults(filters, pagination);
    this.sendSuccess(res, result);
  });

  // Statistics
  getLabStats = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const stats = await this.service.getLabStats(filters);
    this.sendSuccess(res, stats);
  });
}
