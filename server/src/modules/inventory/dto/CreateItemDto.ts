export interface CreateItemDto {
  itemName: string;
  itemCode: string;
  category: 'medication' | 'supplies' | 'equipment' | 'consumables' | 'other';
  subcategory?: string;
  description?: string;
  brand?: string;
  model?: string;
  unitOfMeasure: string;
  size?: string;
  color?: string;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  sellingPrice?: number;
  batchTracking: boolean;
  expirationTracking: boolean;
  serialNumberTracking: boolean;
  primaryLocation: string;
  secondaryLocations?: string[];
  isControlled: boolean;
  primarySupplier?: string;
  alternativeSuppliers?: string[];
  fdaApprovalNumber?: string;
  ndcNumber?: string;
}

export interface UpdateItemDto extends Partial<CreateItemDto> {
  status?: 'active' | 'inactive' | 'discontinued';
}

export interface ItemFiltersDto {
  category?: string;
  subcategory?: string;
  status?: string;
  location?: string;
  lowStock?: boolean;
  search?: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
}
