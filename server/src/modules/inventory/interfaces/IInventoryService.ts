import { IInventoryItem, IInventoryTransaction, IPurchaseOrder } from '../models';

export interface IInventoryService {
  // Item Management
  createItem(itemData: any): Promise<IInventoryItem>;
  getItems(filters: any, pagination: any): Promise<{ items: IInventoryItem[]; pagination: any }>;
  getItemById(itemId: string): Promise<IInventoryItem | null>;
  updateItem(itemId: string, updateData: any): Promise<IInventoryItem | null>;
  deleteItem(itemId: string): Promise<boolean>;

  // Transaction Management
  createTransaction(transactionData: any): Promise<IInventoryTransaction>;
  getTransactions(filters: any, pagination: any): Promise<{ transactions: IInventoryTransaction[]; pagination: any }>;
  getTransactionById(transactionId: string): Promise<IInventoryTransaction | null>;

  // Purchase Order Management
  createPurchaseOrder(poData: any): Promise<IPurchaseOrder>;
  getPurchaseOrders(filters: any, pagination: any): Promise<{ purchaseOrders: IPurchaseOrder[]; pagination: any }>;
  getPurchaseOrderById(poId: string): Promise<IPurchaseOrder | null>;
  updatePurchaseOrder(poId: string, updateData: any): Promise<IPurchaseOrder | null>;

  // Reports and Analytics
  getLowStockItems(): Promise<IInventoryItem[]>;
  getExpiringItems(daysAhead?: number): Promise<IInventoryItem[]>;
  getUsageAnalytics(filters: any): Promise<any[]>;
}
