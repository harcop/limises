import { Request, Response } from 'express';
import { BaseController } from '../../base/Controller';
import { InventoryService } from '../services/InventoryService';
import { AuthRequest } from '../../../types';
import { validateId, validatePagination, validateDateRange } from '../../../middleware/validation';

export class InventoryController extends BaseController {
  constructor() {
    super(new InventoryService(), 'InventoryController');
  }

  // Item Management
  createItem = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const itemData = req.body;
    itemData.createdBy = req.user.staffId;
    
    const item = await this.service.createItem(itemData);
    
    this.sendSuccess(res, {
      itemId: item.itemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      category: item.category,
      currentStock: item.currentStock,
      status: item.status,
      createdAt: item.createdAt.toISOString()
    }, 'Inventory item created successfully', 201);
  });

  getItems = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      category: req.query.category,
      subcategory: req.query.subcategory,
      status: req.query.status,
      location: req.query.location,
      lowStock: req.query.lowStock === 'true',
      search: req.query.search
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getItems(filters, pagination);
    this.sendSuccess(res, result);
  });

  getItemById = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const item = await this.service.getItemById(itemId);
    
    if (!item) {
      this.sendError(res, 'Inventory item not found', 404);
      return;
    }

    this.sendSuccess(res, { item });
  });

  updateItem = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user.staffId;

    const updatedItem = await this.service.updateItem(itemId, updateData);
    
    if (!updatedItem) {
      this.sendError(res, 'Inventory item not found', 404);
      return;
    }

    this.sendSuccess(res, { item: updatedItem }, 'Inventory item updated successfully');
  });

  deleteItem = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const success = await this.service.deleteItem(itemId);
    
    if (!success) {
      this.sendError(res, 'Inventory item not found', 404);
      return;
    }

    this.sendSuccess(res, null, 'Inventory item deleted successfully');
  });

  // Transaction Management
  createTransaction = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const transactionData = req.body;
    transactionData.createdBy = req.user.staffId;

    const transaction = await this.service.createTransaction(transactionData);
    
    this.sendSuccess(res, {
      transactionId: transaction.transactionId,
      itemId: transaction.itemId,
      transactionType: transaction.transactionType,
      quantity: transaction.quantity,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString()
    }, 'Inventory transaction created successfully', 201);
  });

  getTransactions = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      itemId: req.query.itemId,
      transactionType: req.query.transactionType,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getTransactions(filters, pagination);
    this.sendSuccess(res, result);
  });

  getTransactionById = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { transactionId } = req.params;
    const transaction = await this.service.getTransactionById(transactionId);
    
    if (!transaction) {
      this.sendError(res, 'Inventory transaction not found', 404);
      return;
    }

    this.sendSuccess(res, { transaction });
  });

  // Purchase Order Management
  createPurchaseOrder = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const poData = req.body;
    poData.createdBy = req.user.staffId;

    const purchaseOrder = await this.service.createPurchaseOrder(poData);
    
    this.sendSuccess(res, {
      purchaseOrderId: purchaseOrder.purchaseOrderId,
      orderNumber: purchaseOrder.orderNumber,
      supplierName: purchaseOrder.supplierName,
      status: purchaseOrder.status,
      totalAmount: purchaseOrder.totalAmount,
      createdAt: purchaseOrder.createdAt.toISOString()
    }, 'Purchase order created successfully', 201);
  });

  getPurchaseOrders = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      status: req.query.status,
      supplierId: req.query.supplierId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getPurchaseOrders(filters, pagination);
    this.sendSuccess(res, result);
  });

  getPurchaseOrderById = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { poId } = req.params;
    const purchaseOrder = await this.service.getPurchaseOrderById(poId);
    
    if (!purchaseOrder) {
      this.sendError(res, 'Purchase order not found', 404);
      return;
    }

    this.sendSuccess(res, { purchaseOrder });
  });

  updatePurchaseOrder = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { poId } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user.staffId;

    const updatedPO = await this.service.updatePurchaseOrder(poId, updateData);
    
    if (!updatedPO) {
      this.sendError(res, 'Purchase order not found', 404);
      return;
    }

    this.sendSuccess(res, { purchaseOrder: updatedPO }, 'Purchase order updated successfully');
  });

  // Reports and Analytics
  getLowStockItems = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const lowStockItems = await this.service.getLowStockItems();
    this.sendSuccess(res, { lowStockItems, count: lowStockItems.length });
  });

  getExpiringItems = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const daysAhead = parseInt(req.query.days as string) || 30;
    const expiringItems = await this.service.getExpiringItems(daysAhead);
    this.sendSuccess(res, { expiringItems, count: expiringItems.length, daysAhead });
  });

  getUsageAnalytics = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      itemId: req.query.itemId
    };

    const usageStats = await this.service.getUsageAnalytics(filters);
    this.sendSuccess(res, { usageStats, period: { startDate: filters.startDate, endDate: filters.endDate } });
  });
}
