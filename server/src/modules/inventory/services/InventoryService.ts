import { BaseService } from '../../base/Service';
import { IInventoryService } from '../interfaces/IInventoryService';
import { 
  InventoryItemModel, 
  InventoryTransactionModel, 
  PurchaseOrderModel,
  IInventoryItem,
  IInventoryTransaction,
  IPurchaseOrder
} from '../models';
import { generateId, sanitizeString } from '../../../utils/helpers';
import { CreateItemDto, UpdateItemDto, ItemFiltersDto, PaginationDto } from '../dto/CreateItemDto';

export class InventoryService extends BaseService implements IInventoryService {
  constructor() {
    super('InventoryService');
  }

  // Item Management
  async createItem(itemData: CreateItemDto): Promise<IInventoryItem> {
    try {
      const itemId = generateId('ITEM', 6);

      const newItem = new InventoryItemModel({
        itemId,
        itemName: sanitizeString(itemData.itemName),
        itemCode: sanitizeString(itemData.itemCode),
        category: itemData.category,
        subcategory: sanitizeString(itemData.subcategory),
        description: sanitizeString(itemData.description),
        brand: sanitizeString(itemData.brand),
        model: sanitizeString(itemData.model),
        unitOfMeasure: sanitizeString(itemData.unitOfMeasure),
        size: sanitizeString(itemData.size),
        color: sanitizeString(itemData.color),
        currentStock: 0,
        minimumStock: itemData.minimumStock,
        maximumStock: itemData.maximumStock,
        reorderPoint: itemData.reorderPoint,
        reorderQuantity: itemData.reorderQuantity,
        unitCost: itemData.unitCost,
        sellingPrice: itemData.sellingPrice,
        batchTracking: itemData.batchTracking,
        expirationTracking: itemData.expirationTracking,
        serialNumberTracking: itemData.serialNumberTracking,
        primaryLocation: sanitizeString(itemData.primaryLocation),
        secondaryLocations: itemData.secondaryLocations || [],
        status: 'active',
        isControlled: itemData.isControlled,
        primarySupplier: sanitizeString(itemData.primarySupplier),
        alternativeSuppliers: itemData.alternativeSuppliers || [],
        fdaApprovalNumber: sanitizeString(itemData.fdaApprovalNumber),
        ndcNumber: sanitizeString(itemData.ndcNumber)
      });

      await newItem.save();
      this.log('info', `Item created: ${itemId}`);
      return newItem;
    } catch (error) {
      this.handleError(error, 'Create item');
    }
  }

  async getItems(filters: ItemFiltersDto, pagination: PaginationDto): Promise<{ items: IInventoryItem[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (filters.category) filter.category = filters.category;
      if (filters.subcategory) filter.subcategory = filters.subcategory;
      if (filters.status) filter.status = filters.status;
      if (filters.location) filter.primaryLocation = filters.location;
      if (filters.lowStock) filter.currentStock = { $lte: '$reorderPoint' };
      if (filters.search) {
        filter.$or = [
          { itemName: { $regex: filters.search, $options: 'i' } },
          { itemCode: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const total = await InventoryItemModel.countDocuments(filter);
      const items = await InventoryItemModel.find(filter)
        .select('itemId itemName itemCode category subcategory currentStock minimumStock maximumStock reorderPoint unitCost primaryLocation status isLowStock isOverstock')
        .sort({ itemName: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (error) {
      this.handleError(error, 'Get items');
    }
  }

  async getItemById(itemId: string): Promise<IInventoryItem | null> {
    try {
      return await InventoryItemModel.findOne({ itemId }).lean();
    } catch (error) {
      this.handleError(error, 'Get item by ID');
    }
  }

  async updateItem(itemId: string, updateData: UpdateItemDto): Promise<IInventoryItem | null> {
    try {
      // Sanitize string fields
      const sanitizedData = { ...updateData };
      if (sanitizedData.itemName) sanitizedData.itemName = sanitizeString(sanitizedData.itemName);
      if (sanitizedData.itemCode) sanitizedData.itemCode = sanitizeString(sanitizedData.itemCode);
      if (sanitizedData.description) sanitizedData.description = sanitizeString(sanitizedData.description);
      if (sanitizedData.brand) sanitizedData.brand = sanitizeString(sanitizedData.brand);
      if (sanitizedData.model) sanitizedData.model = sanitizeString(sanitizedData.model);
      if (sanitizedData.primaryLocation) sanitizedData.primaryLocation = sanitizeString(sanitizedData.primaryLocation);

      const updatedItem = await InventoryItemModel.findOneAndUpdate(
        { itemId },
        { $set: sanitizedData },
        { new: true, runValidators: true }
      ).lean();

      if (updatedItem) {
        this.log('info', `Item updated: ${itemId}`);
      }
      return updatedItem;
    } catch (error) {
      this.handleError(error, 'Update item');
    }
  }

  async deleteItem(itemId: string): Promise<boolean> {
    try {
      const result = await InventoryItemModel.findOneAndUpdate(
        { itemId },
        { $set: { status: 'inactive' } }
      );
      return !!result;
    } catch (error) {
      this.handleError(error, 'Delete item');
    }
  }

  // Transaction Management
  async createTransaction(transactionData: any): Promise<IInventoryTransaction> {
    try {
      const transactionId = generateId('TXN', 6);

      const newTransaction = new InventoryTransactionModel({
        transactionId,
        itemId: transactionData.itemId,
        transactionType: transactionData.transactionType,
        quantity: transactionData.quantity,
        unitCost: transactionData.unitCost,
        fromLocation: sanitizeString(transactionData.fromLocation),
        toLocation: sanitizeString(transactionData.toLocation),
        referenceNumber: sanitizeString(transactionData.referenceNumber),
        referenceType: transactionData.referenceType,
        batchNumber: sanitizeString(transactionData.batchNumber),
        lotNumber: sanitizeString(transactionData.lotNumber),
        serialNumber: sanitizeString(transactionData.serialNumber),
        expirationDate: transactionData.expirationDate ? new Date(transactionData.expirationDate) : undefined,
        reason: sanitizeString(transactionData.reason),
        notes: sanitizeString(transactionData.notes),
        status: 'pending'
      });

      await newTransaction.save();

      // Update item stock if transaction is completed
      if (['receipt', 'issue', 'adjustment'].includes(transactionData.transactionType)) {
        await this.updateItemStock(transactionData.itemId, transactionData.quantity, transactionData.transactionType);
      }

      this.log('info', `Transaction created: ${transactionId}`);
      return newTransaction;
    } catch (error) {
      this.handleError(error, 'Create transaction');
    }
  }

  async getTransactions(filters: any, pagination: PaginationDto): Promise<{ transactions: IInventoryTransaction[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (filters.itemId) filter.itemId = filters.itemId;
      if (filters.transactionType) filter.transactionType = filters.transactionType;
      if (filters.status) filter.status = filters.status;
      if (filters.startDate && filters.endDate) {
        filter.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
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

      return {
        transactions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (error) {
      this.handleError(error, 'Get transactions');
    }
  }

  async getTransactionById(transactionId: string): Promise<IInventoryTransaction | null> {
    try {
      return await InventoryTransactionModel.findOne({ transactionId }).lean();
    } catch (error) {
      this.handleError(error, 'Get transaction by ID');
    }
  }

  // Purchase Order Management
  async createPurchaseOrder(poData: any): Promise<IPurchaseOrder> {
    try {
      const purchaseOrderId = generateId('PO', 6);
      const orderNumber = `PO-${Date.now()}`;

      const newPurchaseOrder = new PurchaseOrderModel({
        purchaseOrderId,
        orderNumber,
        supplierId: poData.supplierId,
        supplierName: sanitizeString(poData.supplierName),
        orderDate: new Date(),
        expectedDeliveryDate: poData.expectedDeliveryDate ? new Date(poData.expectedDeliveryDate) : undefined,
        items: poData.items || [],
        subtotal: 0,
        taxAmount: poData.taxAmount || 0,
        shippingCost: poData.shippingCost || 0,
        totalAmount: 0,
        status: 'draft',
        notes: sanitizeString(poData.notes),
        internalNotes: sanitizeString(poData.internalNotes)
      });

      await newPurchaseOrder.save();
      this.log('info', `Purchase order created: ${purchaseOrderId}`);
      return newPurchaseOrder;
    } catch (error) {
      this.handleError(error, 'Create purchase order');
    }
  }

  async getPurchaseOrders(filters: any, pagination: PaginationDto): Promise<{ purchaseOrders: IPurchaseOrder[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (filters.status) filter.status = filters.status;
      if (filters.supplierId) filter.supplierId = filters.supplierId;
      if (filters.startDate && filters.endDate) {
        filter.orderDate = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const total = await PurchaseOrderModel.countDocuments(filter);
      const purchaseOrders = await PurchaseOrderModel.find(filter)
        .select('purchaseOrderId orderNumber supplierName orderDate expectedDeliveryDate totalAmount status items')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        purchaseOrders,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (error) {
      this.handleError(error, 'Get purchase orders');
    }
  }

  async getPurchaseOrderById(poId: string): Promise<IPurchaseOrder | null> {
    try {
      return await PurchaseOrderModel.findOne({ purchaseOrderId: poId }).lean();
    } catch (error) {
      this.handleError(error, 'Get purchase order by ID');
    }
  }

  async updatePurchaseOrder(poId: string, updateData: any): Promise<IPurchaseOrder | null> {
    try {
      const updatedPO = await PurchaseOrderModel.findOneAndUpdate(
        { purchaseOrderId: poId },
        { $set: updateData },
        { new: true, runValidators: true }
      ).lean();

      if (updatedPO) {
        this.log('info', `Purchase order updated: ${poId}`);
      }
      return updatedPO;
    } catch (error) {
      this.handleError(error, 'Update purchase order');
    }
  }

  // Reports and Analytics
  async getLowStockItems(): Promise<IInventoryItem[]> {
    try {
      return await InventoryItemModel.find({
        $expr: { $lte: ['$currentStock', '$reorderPoint'] },
        status: 'active'
      })
      .select('itemId itemName itemCode currentStock reorderPoint primaryLocation category')
      .sort({ currentStock: 1 })
      .lean();
    } catch (error) {
      this.handleError(error, 'Get low stock items');
    }
  }

  async getExpiringItems(daysAhead: number = 30): Promise<IInventoryItem[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      return await InventoryItemModel.find({
        expirationDate: { $lte: futureDate },
        expirationTracking: true,
        status: 'active'
      })
      .select('itemId itemName itemCode expirationDate currentStock primaryLocation')
      .sort({ expirationDate: 1 })
      .lean();
    } catch (error) {
      this.handleError(error, 'Get expiring items');
    }
  }

  async getUsageAnalytics(filters: any): Promise<any[]> {
    try {
      const matchFilter: any = {};
      if (filters.startDate && filters.endDate) {
        matchFilter.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      if (filters.itemId) matchFilter.itemId = filters.itemId;

      return await InventoryTransactionModel.aggregate([
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
    } catch (error) {
      this.handleError(error, 'Get usage analytics');
    }
  }

  // Private helper methods
  private async updateItemStock(itemId: string, quantity: number, transactionType: string): Promise<void> {
    try {
      const item = await InventoryItemModel.findOne({ itemId });
      if (!item) return;

      let newStock = item.currentStock;
      if (transactionType === 'receipt' || transactionType === 'adjustment') {
        newStock += Math.abs(quantity);
      } else if (transactionType === 'issue') {
        newStock -= Math.abs(quantity);
      }

      if (newStock < 0) {
        throw new Error('Insufficient stock for this transaction');
      }

      await InventoryItemModel.findOneAndUpdate(
        { itemId },
        { $set: { currentStock: newStock } }
      );
    } catch (error) {
      this.handleError(error, 'Update item stock');
    }
  }
}
