// ==============================================
// COMMON/SHARED INTERFACES
// ==============================================

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Database Types
export interface DatabaseRow {
  [key: string]: any;
}

export interface DatabaseResult {
  acknowledged: boolean;
  insertedId?: string;
  modifiedCount?: number;
  upsertedCount?: number;
  matchedCount?: number;
  deletedCount?: number;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Query Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export interface SearchQuery {
  search?: string;
}
