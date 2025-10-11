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
   * Get appropriate status code based on error type
   */
  protected getErrorStatusCode(error: any): number {
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
