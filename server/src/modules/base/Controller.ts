import { Response } from 'express';
import { logger } from '../../utils/logger';

/**
 * Base controller class with common error handling patterns
 */
export abstract class BaseController {
  protected controllerName: string;

  constructor(controllerName: string) {
    this.controllerName = controllerName;
  }

  /**
   * Standard success response
   */
  protected sendSuccessResponse(
    res: Response, 
    data: any, 
    message: string = 'Operation completed successfully',
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Standard error response
   */
  protected sendErrorResponse(
    res: Response, 
    error: Error | string, 
    message: string = 'Operation failed',
    statusCode: number = 500
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    logger.error(`[${this.controllerName}] ${message}:`, error);
    
    res.status(statusCode).json({
      success: false,
      message,
      error: errorMessage
    });
  }

  /**
   * Standard not found response
   */
  protected sendNotFoundResponse(
    res: Response, 
    resource: string = 'Resource'
  ): void {
    res.status(404).json({
      success: false,
      message: `${resource} not found`,
      error: `${resource} not found`
    });
  }

  /**
   * Standard validation error response
   */
  protected sendValidationErrorResponse(
    res: Response, 
    errors: any[]
  ): void {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  /**
   * Standard unauthorized response
   */
  protected sendUnauthorizedResponse(
    res: Response, 
    message: string = 'Unauthorized access'
  ): void {
    res.status(401).json({
      success: false,
      message,
      error: 'Unauthorized access'
    });
  }

  /**
   * Standard forbidden response
   */
  protected sendForbiddenResponse(
    res: Response, 
    message: string = 'Insufficient permissions'
  ): void {
    res.status(403).json({
      success: false,
      message,
      error: 'Insufficient permissions'
    });
  }

  /**
   * Handle async operations with standard error handling
   */
  protected async handleAsyncOperation<T>(
    res: Response,
    operation: () => Promise<T>,
    successMessage: string = 'Operation completed successfully',
    errorMessage: string = 'Operation failed',
    successStatusCode: number = 200
  ): Promise<void> {
    try {
      const result = await operation();
      this.sendSuccessResponse(res, result, successMessage, successStatusCode);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, errorMessage, statusCode);
    }
  }

  /**
   * Handle async operations that return paginated results
   */
  protected async handlePaginatedOperation<T>(
    res: Response,
    operation: () => Promise<{ data: T[]; pagination: any }>,
    successMessage: string = 'Data retrieved successfully'
  ): Promise<void> {
    try {
      const result = await operation();
      res.json({
        success: true,
        message: successMessage,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve data', statusCode);
    }
  }

  /**
   * Get appropriate status code based on error type
   */
  private getErrorStatusCode(error: any): number {
    if (error.message?.includes('not found')) {
      return 404;
    }
    if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
      return 401;
    }
    if (error.message?.includes('forbidden') || error.message?.includes('permission')) {
      return 403;
    }
    if (error.message?.includes('validation') || error.message?.includes('invalid')) {
      return 400;
    }
    if (error.message?.includes('conflict') || error.message?.includes('already exists')) {
      return 409;
    }
    return 500;
  }

  /**
   * Log controller action
   */
  protected logAction(action: string, details?: any): void {
    logger.info(`[${this.controllerName}] ${action}`, details || '');
  }

  /**
   * Log error with context
   */
  protected logError(context: string, error: any): void {
    logger.error(`[${this.controllerName}] ${context}:`, error);
  }
}
