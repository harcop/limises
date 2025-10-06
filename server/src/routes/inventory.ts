import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
const { 
  generateId,
  formatDate 
} = require('../utils/helpers');
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   POST /api/inventory/items
// @desc    Create a new inventory item
// @access  Private (Admin, Inventory Manager only)
router.post('/items', authenticate, authorize('admin', 'inventory_manager'), [
  require('express-validator').body('itemName').trim().isLength({ min: 1, max: 200 }).withMessage('Item name is required'),
  require('express-validator').body('itemCategory').trim().isLength({ min: 1, max: 100 }).withMessage('Item category is required'),
  require('express-validator').body('itemType').optional().trim().isLength({ max: 100 }).withMessage('Item type must be less than 100 characters'),
  require('express-validator').body('unitOfMeasure').optional().trim().isLength({ max: 50 }).withMessage('Unit of measure must be less than 50 characters'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      itemName,
      itemCategory,
      itemType,
      unitOfMeasure,
      description
    } = req.body;

    // Check if item already exists
    const existingItem = await getRow(
      'SELECT item_id FROM inventory_items WHERE item_name = ?',
      [itemName]
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: 'Item with this name already exists'
      });
    }

    // Generate item ID
    const itemId = generateId('ITEM', 6);

    await runQuery(
      `INSERT INTO inventory_items (
        item_id, item_name, item_category, item_type, unit_of_measure, description, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [itemId, itemName, itemCategory, itemType, unitOfMeasure, description]
    );

    logger.info(`Inventory item created: ${itemId} - ${itemName} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      item: {
        itemId,
        itemName,
        itemCategory,
        itemType,
        unitOfMeasure,
        isActive: true
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
// @desc    Get inventory items with filters
// @access  Private (Staff only)
router.get('/items', authenticate, authorize('receptionist', 'nurse', 'admin', 'inventory_manager'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      itemCategory,
      itemType,
      isActive,
      search
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (itemCategory) {
      whereClause += ' AND item_category = ?';
      params.push(itemCategory);
    }

    if (itemType) {
      whereClause += ' AND item_type = ?';
      params.push(itemType);
    }

    if (isActive !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    if (search) {
      whereClause += ' AND (item_name LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total FROM inventory_items ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get inventory items
    const items = await getAll(
      `SELECT * FROM inventory_items 
       ${whereClause}
       ORDER BY item_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
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
// @desc    Get inventory item by ID
// @access  Private (Staff only)
router.get('/items/:itemId', authenticate, authorize('receptionist', 'nurse', 'admin', 'inventory_manager'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;

    const item = await getRow(
      'SELECT * FROM inventory_items WHERE item_id = ?',
      [itemId]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
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

// @route   POST /api/inventory/stock
// @desc    Add inventory stock
// @access  Private (Admin, Inventory Manager only)
router.post('/stock', authenticate, authorize('admin', 'inventory_manager'), [
  require('express-validator').body('itemId').trim().isLength({ min: 1 }).withMessage('Item ID is required'),
  require('express-validator').body('batchNumber').optional().trim().isLength({ max: 100 }).withMessage('Batch number must be less than 100 characters'),
  require('express-validator').body('expiryDate').optional().isISO8601().withMessage('Valid expiry date is required'),
  require('express-validator').body('quantityInStock').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  require('express-validator').body('unitCost').isDecimal().withMessage('Valid unit cost is required'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      itemId,
      batchNumber,
      expiryDate,
      quantityInStock,
      reorderLevel,
      unitCost,
      supplier,
      location
    } = req.body;

    // Check if item exists
    const item = await getRow(
      'SELECT item_id, item_name FROM inventory_items WHERE item_id = ? AND is_active = 1',
      [itemId]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found or inactive'
      });
    }

    // Generate stock ID
    const stockId = generateId('STOCK', 6);

    await runQuery(
      `INSERT INTO inventory_stock (
        stock_id, item_id, batch_number, expiry_date, quantity_in_stock, reorder_level,
        unit_cost, supplier, location, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', CURRENT_TIMESTAMP)`,
      [
        stockId,
        itemId,
        batchNumber,
        expiryDate ? formatDate(expiryDate) : null,
        quantityInStock,
        reorderLevel || 10,
        unitCost,
        supplier,
        location
      ]
    );

    logger.info(`Inventory stock added: ${stockId} for item ${itemId} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Inventory stock added successfully',
      stock: {
        stockId,
        itemId,
        itemName: item.item_name,
        batchNumber,
        quantityInStock,
        unitCost
      }
    });

  } catch (error) {
    logger.error('Add inventory stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding inventory stock'
    });
  }
});

// @route   GET /api/inventory/stock
// @desc    Get inventory stock with filters
// @access  Private (Staff only)
router.get('/stock', authenticate, authorize('receptionist', 'nurse', 'admin', 'inventory_manager'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      itemId,
      status,
      lowStock,
      location,
      supplier
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (itemId) {
      whereClause += ' AND ist.item_id = ?';
      params.push(itemId);
    }

    if (status) {
      whereClause += ' AND ist.status = ?';
      params.push(status);
    }

    if (location) {
      whereClause += ' AND ist.location = ?';
      params.push(location);
    }

    if (supplier) {
      whereClause += ' AND ist.supplier = ?';
      params.push(supplier);
    }

    if (lowStock === 'true') {
      whereClause += ' AND ist.quantity_in_stock <= ist.reorder_level';
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM inventory_stock ist
       LEFT JOIN inventory_items ii ON ist.item_id = ii.item_id
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get inventory stock
    const stock = await getAll(
      `SELECT 
        ist.*, ii.item_name, ii.item_category, ii.item_type, ii.unit_of_measure
       FROM inventory_stock ist
       LEFT JOIN inventory_items ii ON ist.item_id = ii.item_id
       ${whereClause}
       ORDER BY ii.item_name, ist.expiry_date
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      stock,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get inventory stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving inventory stock'
    });
  }
});

// @route   PUT /api/inventory/stock/:stockId
// @desc    Update inventory stock
// @access  Private (Admin, Inventory Manager only)
router.put('/stock/:stockId', authenticate, authorize('admin', 'inventory_manager'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stockId } = req.params;
    const updates = req.body;

    // Check if stock item exists
    const existingStock = await getRow(
      'SELECT * FROM inventory_stock WHERE stock_id = ?',
      [stockId]
    );

    if (!existingStock) {
      return res.status(404).json({
        success: false,
        error: 'Inventory stock item not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'quantityInStock', 'reorderLevel', 'unitCost', 'supplier', 'location', 'status'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(stockId);

    await runQuery(
      `UPDATE inventory_stock SET ${updateFields.join(', ')} WHERE stock_id = ?`,
      updateValues
    );

    logger.info(`Inventory stock updated: ${stockId} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Inventory stock updated successfully'
    });

  } catch (error) {
    logger.error('Update inventory stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating inventory stock'
    });
  }
});

// @route   GET /api/inventory/categories
// @desc    Get all inventory categories
// @access  Private (Staff only)
router.get('/categories', authenticate, authorize('receptionist', 'nurse', 'admin', 'inventory_manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await getAll(
      'SELECT DISTINCT item_category FROM inventory_items WHERE item_category IS NOT NULL AND item_category != "" ORDER BY item_category'
    );

    res.json({
      success: true,
      categories: categories.map(cat => cat.item_category)
    });

  } catch (error) {
    logger.error('Get inventory categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving inventory categories'
    });
  }
});

// @route   GET /api/inventory/types
// @desc    Get all inventory types
// @access  Private (Staff only)
router.get('/types', authenticate, authorize('receptionist', 'nurse', 'admin', 'inventory_manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const types = await getAll(
      'SELECT DISTINCT item_type FROM inventory_items WHERE item_type IS NOT NULL AND item_type != "" ORDER BY item_type'
    );

    res.json({
      success: true,
      types: types.map(type => type.item_type)
    });

  } catch (error) {
    logger.error('Get inventory types error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving inventory types'
    });
  }
});

// @route   GET /api/inventory/stats
// @desc    Get inventory statistics
// @access  Private (Admin, Manager only)
router.get('/stats', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get item statistics
    const itemStats = await getRow(
      `SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_items,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_items,
        COUNT(DISTINCT item_category) as total_categories,
        COUNT(DISTINCT item_type) as total_types
       FROM inventory_items`
    );

    // Get stock statistics
    const stockStats = await getRow(
      `SELECT 
        COUNT(*) as total_stock_items,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_items,
        COUNT(CASE WHEN status = 'low_stock' THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN status = 'out_of_stock' THEN 1 END) as out_of_stock_items,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_items,
        SUM(quantity_in_stock * unit_cost) as total_inventory_value
       FROM inventory_stock`
    );

    // Get category statistics
    const categoryStats = await getAll(
      `SELECT 
        ii.item_category,
        COUNT(*) as total_items,
        COUNT(ist.stock_id) as stock_items,
        SUM(ist.quantity_in_stock) as total_quantity,
        SUM(ist.quantity_in_stock * ist.unit_cost) as category_value
       FROM inventory_items ii
       LEFT JOIN inventory_stock ist ON ii.item_id = ist.item_id
       WHERE ii.item_category IS NOT NULL AND ii.item_category != ""
       GROUP BY ii.item_category
       ORDER BY category_value DESC`
    );

    res.json({
      success: true,
      stats: {
        items: itemStats,
        stock: stockStats,
        byCategory: categoryStats
      }
    });

  } catch (error) {
    logger.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving inventory statistics'
    });
  }
});

export default router;
