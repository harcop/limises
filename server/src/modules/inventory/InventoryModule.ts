import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { InventoryController } from './controllers/InventoryController';
import { authenticate, authorize } from '../../../middleware/auth';
import { validateId, validatePagination, validateDateRange } from '../../../middleware/validation';

export class InventoryModule extends BaseModule {
  private controller: InventoryController;

  constructor() {
    super('InventoryModule');
    this.controller = new InventoryController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // ==============================================
    // INVENTORY ITEMS MANAGEMENT
    // ==============================================

    // @route   POST /api/inventory/items
    // @desc    Create a new inventory item
    // @access  Private (Admin, Manager, Inventory Staff)
    this.router.post('/items', 
      authorize('admin', 'manager', 'inventory'), 
      this.controller.createItem
    );

    // @route   GET /api/inventory/items
    // @desc    Get inventory items with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/items', 
      validatePagination, 
      this.controller.getItems
    );

    // @route   GET /api/inventory/items/:itemId
    // @desc    Get a specific inventory item
    // @access  Private (All Staff)
    this.router.get('/items/:itemId', 
      validateId, 
      this.controller.getItemById
    );

    // @route   PUT /api/inventory/items/:itemId
    // @desc    Update an inventory item
    // @access  Private (Admin, Manager, Inventory Staff)
    this.router.put('/items/:itemId', 
      authorize('admin', 'manager', 'inventory'), 
      validateId, 
      this.controller.updateItem
    );

    // @route   DELETE /api/inventory/items/:itemId
    // @desc    Delete an inventory item
    // @access  Private (Admin, Manager, Inventory Staff)
    this.router.delete('/items/:itemId', 
      authorize('admin', 'manager', 'inventory'), 
      validateId, 
      this.controller.deleteItem
    );

    // ==============================================
    // INVENTORY TRANSACTIONS
    // ==============================================

    // @route   POST /api/inventory/transactions
    // @desc    Create a new inventory transaction
    // @access  Private (All Staff)
    this.router.post('/transactions', 
      this.controller.createTransaction
    );

    // @route   GET /api/inventory/transactions
    // @desc    Get inventory transactions with filtering
    // @access  Private (All Staff)
    this.router.get('/transactions', 
      validatePagination, 
      validateDateRange, 
      this.controller.getTransactions
    );

    // @route   GET /api/inventory/transactions/:transactionId
    // @desc    Get a specific inventory transaction
    // @access  Private (All Staff)
    this.router.get('/transactions/:transactionId', 
      validateId, 
      this.controller.getTransactionById
    );

    // ==============================================
    // PURCHASE ORDERS
    // ==============================================

    // @route   POST /api/inventory/purchase-orders
    // @desc    Create a new purchase order
    // @access  Private (Admin, Manager, Procurement)
    this.router.post('/purchase-orders', 
      authorize('admin', 'manager', 'procurement'), 
      this.controller.createPurchaseOrder
    );

    // @route   GET /api/inventory/purchase-orders
    // @desc    Get purchase orders with filtering
    // @access  Private (Admin, Manager, Procurement)
    this.router.get('/purchase-orders', 
      authorize('admin', 'manager', 'procurement'), 
      validatePagination, 
      this.controller.getPurchaseOrders
    );

    // @route   GET /api/inventory/purchase-orders/:poId
    // @desc    Get a specific purchase order
    // @access  Private (Admin, Manager, Procurement)
    this.router.get('/purchase-orders/:poId', 
      authorize('admin', 'manager', 'procurement'), 
      validateId, 
      this.controller.getPurchaseOrderById
    );

    // @route   PUT /api/inventory/purchase-orders/:poId
    // @desc    Update a purchase order
    // @access  Private (Admin, Manager, Procurement)
    this.router.put('/purchase-orders/:poId', 
      authorize('admin', 'manager', 'procurement'), 
      validateId, 
      this.controller.updatePurchaseOrder
    );

    // ==============================================
    // INVENTORY REPORTS AND ANALYTICS
    // ==============================================

    // @route   GET /api/inventory/reports/low-stock
    // @desc    Get low stock items
    // @access  Private (All Staff)
    this.router.get('/reports/low-stock', 
      this.controller.getLowStockItems
    );

    // @route   GET /api/inventory/reports/expiring
    // @desc    Get items nearing expiration
    // @access  Private (All Staff)
    this.router.get('/reports/expiring', 
      this.controller.getExpiringItems
    );

    // @route   GET /api/inventory/reports/usage
    // @desc    Get item usage analytics
    // @access  Private (Admin, Manager, Inventory Staff)
    this.router.get('/reports/usage', 
      authorize('admin', 'manager', 'inventory'), 
      validateDateRange, 
      this.controller.getUsageAnalytics
    );

    this.log('info', 'Inventory module routes initialized');
  }
}
