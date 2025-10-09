import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateId, validatePagination, validateDateRange } from '../middleware/validation';
import {
  InventoryItemModel,
  InventoryTransactionModel,
  PurchaseOrderModel
} from '../models';
import {
  generateId,
  sanitizeString
} from '../utils/helpers';
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// ==============================================
// INVENTORY ITEMS MANAGEMENT
// ==============================================

// @route   POST /api/inventory/items
// @desc    Create a new inventory item
// @access  Private (Admin, Manager, Inventory Staff)
router.post('/items', authenticate, authorize('admin', 'manager', 'inventory'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      itemName,
      itemCode,
      category,
      subcategory,
      description,
      brand,
      model,
      unitOfMeasure,
      size,
      color,
      minimumStock,
      maximumStock,
      reorderPoint,
      reorderQuantity,
      unitCost,
      sellingPrice,
      batchTracking,
      expirationTracking,
      serialNumberTracking,
      primaryLocation,
      secondaryLocations,
      isControlled,
      primarySupplier,
      alternativeSuppliers,
      fdaApprovalNumber,
      ndcNumber
    } = req.body;

    const itemId = generateId('ITEM', 6);

    const newItem = new InventoryItemModel({
      itemId,
      itemName: sanitizeString(itemName),
      itemCode: sanitizeString(itemCode),
      category,
      subcategory: sanitizeString(subcategory),
      description: sanitizeString(description),
      brand: sanitizeString(brand),
      model: sanitizeString(model),
      unitOfMeasure: sanitizeString(unitOfMeasure),
      size: sanitizeString(size),
      color: sanitizeString(color),
      currentStock: 0,
      minimumStock: minimumStock || 0,
      maximumStock: maximumStock || 1000,
      reorderPoint: reorderPoint || 10,
      reorderQuantity: reorderQuantity || 50,
      unitCost: unitCost || 0,
      sellingPrice,
      batchTracking: batchTracking || false,
      expirationTracking: expirationTracking || false,
      serialNumberTracking: serialNumberTracking || false,
      primaryLocation: sanitizeString(primaryLocation),
      secondaryLocations: secondaryLocations || [],
      status: 'active',
      isControlled: isControlled || false,
      primarySupplier: sanitizeString(primarySupplier),
      alternativeSuppliers: alternativeSuppliers || [],
      fdaApprovalNumber: sanitizeString(fdaApprovalNumber),
      ndcNumber: sanitizeString(ndcNumber),
      createdBy: req.user.staffId
    });

    await newItem.save();

    logger.info(`Inventory item created: ${itemId} by staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      item: {
        itemId,
        itemName,
        itemCode,
        category,
        currentStock: 0,
        status: 'active',
        createdAt: newItem.createdAt.toISOString()
      }
    });

  } catch (error) {
    logger.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating inventory item'
    });
  }
});

// @route   GET /api/inventory/items
// @desc    Get inventory items with filtering and pagination
// @access  Private (All Staff)
router.get('/items', authenticate, validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const { category, subcategory, status, location, lowStock, search } = req.query;

    const filter: any = {};

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (status) filter.status = status;
    if (location) filter.primaryLocation = location;
    if (lowStock === 'true') filter.currentStock = { $lte: '$reorderPoint' };
    if (search) {
      filter.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await InventoryItemModel.countDocuments(filter);
    const items = await InventoryItemModel.find(filter)
      .select('itemId itemName itemCode category subcategory currentStock minimumStock maximumStock reorderPoint unitCost primaryLocation status isLowStock isOverstock')
      .sort({ itemName: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });

  } catch (error) {
    logger.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving inventory items'
    });
  }
});

// @route   GET /api/inventory/items/:itemId
// @desc    Get a specific inventory item
// @access  Private (All Staff)
router.get('/items/:itemId', authenticate, validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;

    const item = await InventoryItemModel.findOne({ itemId }).lean();

    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
      return;
    }

    res.json({
      success: true,
      item
    });

  } catch (error) {
    logger.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving inventory item'
    });
  }
});

// @route   PUT /api/inventory/items/:itemId
// @desc    Update an inventory item
// @access  Private (Admin, Manager, Inventory Staff)
router.put('/items/:itemId', authenticate, authorize('admin', 'manager', 'inventory'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.itemId;
    delete updateData.currentStock;
    delete updateData.createdBy;
    delete updateData.createdAt;

    // Sanitize string fields
    if (updateData.itemName) updateData.itemName = sanitizeString(updateData.itemName);
    if (updateData.itemCode) updateData.itemCode = sanitizeString(updateData.itemCode);
    if (updateData.description) updateData.description = sanitizeString(updateData.description);
    if (updateData.brand) updateData.brand = sanitizeString(updateData.brand);
    if (updateData.model) updateData.model = sanitizeString(updateData.model);
    if (updateData.primaryLocation) updateData.primaryLocation = sanitizeString(updateData.primaryLocation);

    updateData.updatedBy = req.user.staffId;

    const updatedItem = await InventoryItemModel.findOneAndUpdate(
      { itemId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedItem) {
      res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
      return;
    }

    logger.info(`Inventory item updated: ${itemId} by staff ${req.user.staffId}`);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      item: updatedItem
    });

  } catch (error) {
    logger.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating inventory item'
    });
  }
});

// ==============================================
// INVENTORY TRANSACTIONS
// ==============================================

// @route   POST /api/inventory/transactions
// @desc    Create a new inventory transaction
// @access  Private (All Staff)
router.post('/transactions', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      itemId,
      transactionType,
      quantity,
      unitCost,
      fromLocation,
      toLocation,
      referenceNumber,
      referenceType,
      batchNumber,
      lotNumber,
      serialNumber,
      expirationDate,
      reason,
      notes
    } = req.body;

    const transactionId = generateId('TXN', 6);

    const newTransaction = new InventoryTransactionModel({
      transactionId,
      itemId,
      transactionType,
      quantity,
      unitCost,
      fromLocation: sanitizeString(fromLocation),
      toLocation: sanitizeString(toLocation),
      referenceNumber: sanitizeString(referenceNumber),
      referenceType,
      batchNumber: sanitizeString(batchNumber),
      lotNumber: sanitizeString(lotNumber),
      serialNumber: sanitizeString(serialNumber),
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      reason: sanitizeString(reason),
      notes: sanitizeString(notes),
      status: 'pending',
      createdBy: req.user.staffId
    });

    await newTransaction.save();

    // Update item stock if transaction is completed
    if (transactionType === 'receipt' || transactionType === 'issue' || transactionType === 'adjustment') {
      const item = await InventoryItemModel.findOne({ itemId });
      if (item) {
        let newStock = item.currentStock;
        if (transactionType === 'receipt' || transactionType === 'adjustment') {
          newStock += Math.abs(quantity);
        } else if (transactionType === 'issue') {
          newStock -= Math.abs(quantity);
        }
        
        if (newStock < 0) {
          res.status(400).json({
            success: false,
            error: 'Insufficient stock for this transaction'
          });
          return;
        }

        await InventoryItemModel.findOneAndUpdate(
          { itemId },
          { $set: { currentStock: newStock } }
        );
      }
    }

    logger.info(`Inventory transaction created: ${transactionId} by staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'Inventory transaction created successfully',
      transaction: {
        transactionId,
        itemId,
        transactionType,
        quantity,
        status: 'pending',
        createdAt: newTransaction.createdAt.toISOString()
      }
    });

  } catch (error) {
    logger.error('Create inventory transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating inventory transaction'
    });
  }
});

// @route   GET /api/inventory/transactions
// @desc    Get inventory transactions with filtering
// @access  Private (All Staff)
router.get('/transactions', authenticate, validatePagination, validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const { itemId, transactionType, status, startDate, endDate } = req.query;

    const filter: any = {};

    if (itemId) filter.itemId = itemId;
    if (transactionType) filter.transactionType = transactionType;
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const total = await InventoryTransactionModel.countDocuments(filter);
    const transactions = await InventoryTransactionModel.find(filter)
      .populate('itemId', 'itemName itemCode')
      .select('transactionId itemId transactionType quantity unitCost totalCost fromLocation toLocation referenceNumber status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });

  } catch (error) {
    logger.error('Get inventory transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving inventory transactions'
    });
  }
});

// ==============================================
// PURCHASE ORDERS
// ==============================================

// @route   POST /api/inventory/purchase-orders
// @desc    Create a new purchase order
// @access  Private (Admin, Manager, Procurement)
router.post('/purchase-orders', authenticate, authorize('admin', 'manager', 'procurement'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      supplierId,
      supplierName,
      expectedDeliveryDate,
      items,
      taxAmount,
      shippingCost,
      notes,
      internalNotes
    } = req.body;

    const purchaseOrderId = generateId('PO', 6);
    const orderNumber = `PO-${Date.now()}`;

    const newPurchaseOrder = new PurchaseOrderModel({
      purchaseOrderId,
      orderNumber,
      supplierId,
      supplierName: sanitizeString(supplierName),
      orderDate: new Date(),
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
      items: items || [],
      subtotal: 0,
      taxAmount: taxAmount || 0,
      shippingCost: shippingCost || 0,
      totalAmount: 0,
      status: 'draft',
      notes: sanitizeString(notes),
      internalNotes: sanitizeString(internalNotes),
      createdBy: req.user.staffId
    });

    await newPurchaseOrder.save();

    logger.info(`Purchase order created: ${purchaseOrderId} by staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      purchaseOrder: {
        purchaseOrderId,
        orderNumber,
        supplierName,
        status: 'draft',
        totalAmount: newPurchaseOrder.totalAmount,
        createdAt: newPurchaseOrder.createdAt.toISOString()
      }
    });

  } catch (error) {
    logger.error('Create purchase order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating purchase order'
    });
  }
});

// @route   GET /api/inventory/purchase-orders
// @desc    Get purchase orders with filtering
// @access  Private (Admin, Manager, Procurement)
router.get('/purchase-orders', authenticate, authorize('admin', 'manager', 'procurement'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const { status, supplierId, startDate, endDate } = req.query;

    const filter: any = {};

    if (status) filter.status = status;
    if (supplierId) filter.supplierId = supplierId;
    if (startDate && endDate) {
      filter.orderDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const total = await PurchaseOrderModel.countDocuments(filter);
    const purchaseOrders = await PurchaseOrderModel.find(filter)
      .select('purchaseOrderId orderNumber supplierName orderDate expectedDeliveryDate totalAmount status items')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      purchaseOrders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });

  } catch (error) {
    logger.error('Get purchase orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving purchase orders'
    });
  }
});

// ==============================================
// INVENTORY REPORTS AND ANALYTICS
// ==============================================

// @route   GET /api/inventory/reports/low-stock
// @desc    Get low stock items
// @access  Private (All Staff)
router.get('/reports/low-stock', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lowStockItems = await InventoryItemModel.find({
      $expr: { $lte: ['$currentStock', '$reorderPoint'] },
      status: 'active'
    })
    .select('itemId itemName itemCode currentStock reorderPoint primaryLocation category')
    .sort({ currentStock: 1 })
    .lean();

    res.json({
      success: true,
      lowStockItems,
      count: lowStockItems.length
    });

  } catch (error) {
    logger.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving low stock items'
    });
  }
});

// @route   GET /api/inventory/reports/expiring
// @desc    Get items nearing expiration
// @access  Private (All Staff)
router.get('/reports/expiring', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const daysAhead = parseInt(req.query.days as string) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const expiringItems = await InventoryItemModel.find({
      expirationDate: { $lte: futureDate },
      expirationTracking: true,
      status: 'active'
    })
    .select('itemId itemName itemCode expirationDate currentStock primaryLocation')
    .sort({ expirationDate: 1 })
    .lean();

    res.json({
      success: true,
      expiringItems,
      count: expiringItems.length,
      daysAhead
    });

  } catch (error) {
    logger.error('Get expiring items error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving expiring items'
    });
  }
});

// @route   GET /api/inventory/reports/usage
// @desc    Get item usage analytics
// @access  Private (Admin, Manager, Inventory Staff)
router.get('/reports/usage', authenticate, authorize('admin', 'manager', 'inventory'), validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, itemId } = req.query;

    const matchFilter: any = {};
    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    if (itemId) matchFilter.itemId = itemId;

    const usageStats = await InventoryTransactionModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$itemId',
          totalIssued: {
            $sum: {
              $cond: [
                { $eq: ['$transactionType', 'issue'] },
                { $abs: '$quantity' },
                0
              ]
            }
          },
          totalReceived: {
            $sum: {
              $cond: [
                { $eq: ['$transactionType', 'receipt'] },
                '$quantity',
                0
              ]
            }
          },
          totalCost: { $sum: '$totalCost' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'inventory_items',
          localField: '_id',
          foreignField: 'itemId',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $project: {
          itemId: '$_id',
          itemName: '$item.itemName',
          itemCode: '$item.itemCode',
          category: '$item.category',
          totalIssued: 1,
          totalReceived: 1,
          totalCost: 1,
          transactionCount: 1
        }
      },
      { $sort: { totalIssued: -1 } }
    ]);

    res.json({
      success: true,
      usageStats,
      period: { startDate, endDate }
    });

  } catch (error) {
    logger.error('Get usage analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving usage analytics'
    });
  }
});

export default router;
