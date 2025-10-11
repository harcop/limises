/**
 * Custom error types for better type safety and error handling
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string | undefined;
  public readonly value?: any;

  constructor(message: string, field?: string | undefined, value?: any) {
    super(message, 400);
    this.field = field;
    this.value = value;
  }
}

export class NotFoundError extends AppError {
  public readonly resource: string;
  public readonly identifier?: string | undefined;

  constructor(resource: string, identifier?: string | undefined) {
    super(`${resource} not found`, 404);
    this.resource = resource;
    this.identifier = identifier;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  public readonly resource: string;
  public readonly identifier?: string | undefined;

  constructor(resource: string, identifier?: string | undefined) {
    super(`${resource} already exists`, 409);
    this.resource = resource;
    this.identifier = identifier;
  }
}

export class DatabaseError extends AppError {
  public readonly operation: string;
  public readonly table?: string | undefined;

  constructor(message: string, operation: string, table?: string | undefined) {
    super(message, 500);
    this.operation = operation;
    this.table = table;
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;
  public readonly endpoint?: string | undefined;

  constructor(message: string, service: string, endpoint?: string | undefined) {
    super(message, 502);
    this.service = service;
    this.endpoint = endpoint;
  }
}

export class RateLimitError extends AppError {
  public readonly limit: number;
  public readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    super('Rate limit exceeded', 429);
    this.limit = limit;
    this.windowMs = windowMs;
  }
}

export class BusinessLogicError extends AppError {
  public readonly businessRule: string;

  constructor(message: string, businessRule: string) {
    super(message, 422);
    this.businessRule = businessRule;
  }
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: any;
}

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T = any> {
  success: true;
  message: string;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  timestamp: string;
}

/**
 * Validation error details interface
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

/**
 * API response types
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;
export type ApiPaginatedResponse<T = any> = PaginatedResponse<T> | ErrorResponse;
