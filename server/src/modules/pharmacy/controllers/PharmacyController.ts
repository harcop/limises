import { Response } from 'express';
import { BaseController } from '../../base/Controller';
import { PharmacyService } from '../services/PharmacyService';
import { AuthRequest } from '../../../types';

export class PharmacyController extends BaseController {
  constructor() {
    super(new PharmacyService(), 'PharmacyController');
  }

  // Drug management routes
  addDrug = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const drugData = req.body;
    const result = await this.service.addDrug(drugData);
    this.sendSuccess(res, { drug: result }, 'Drug added successfully', 201);
  });

  getDrugs = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      search: req.query.search as string,
      drugClass: req.query.drugClass as string,
      isControlled: req.query.isControlled === 'true' ? true : req.query.isControlled === 'false' ? false : undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getDrugs(filters, pagination);
    this.sendSuccess(res, result);
  });

  getDrug = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { drugId } = req.params;
    const drug = await this.service.getDrug(drugId);
    this.sendSuccess(res, { drug });
  });

  updateDrug = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { drugId } = req.params;
      const updateData = req.body;
    const updatedDrug = await this.service.updateDrug(drugId, updateData);
    this.sendSuccess(res, { drug: updatedDrug }, 'Drug updated successfully');
  });

  deactivateDrug = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { drugId } = req.params;
    await this.service.deactivateDrug(drugId);
    this.sendSuccess(res, null, 'Drug deactivated successfully');
  });

  // Inventory routes
  getInventory = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      drugId: req.query.drugId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getInventory(filters, pagination);
    this.sendSuccess(res, result);
  });

  addInventoryItem = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const inventoryData = req.body;
    const result = await this.service.addInventoryItem(inventoryData);
    this.sendSuccess(res, { inventoryItem: result }, 'Inventory item added successfully', 201);
  });

  // Dispense routes
  getDispenses = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      patientId: req.query.patientId as string,
      drugId: req.query.drugId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getDispenses(filters, pagination);
    this.sendSuccess(res, result);
  });

  dispenseMedication = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const dispenseData = req.body;
    const result = await this.service.dispenseMedication(dispenseData);
    this.sendSuccess(res, { dispense: result }, 'Medication dispensed successfully', 201);
  });

  // Statistics
  getPharmacyStats = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const stats = await this.service.getPharmacyStats();
    this.sendSuccess(res, stats);
  });
}
