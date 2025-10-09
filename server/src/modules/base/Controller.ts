import { Request, Response } from 'express';
import { BaseService } from './Service';

export abstract class BaseController {
  protected service: BaseService;
  protected controllerName: string;

  constructor(service: BaseService, controllerName: string) {
    this.service = service;
    this.controllerName = controllerName;
  }

  protected log(level: 'info' | 'error' | 'warn', message: string, data?: any): void {
    const logMessage = `[${this.controllerName}] ${message}`;
    console.log(`[${level.toUpperCase()}] ${logMessage}`, data || '');
  }

  protected sendSuccess(res: Response, data: any, message?: string, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      message: message || 'Operation successful',
      data
    });
  }

  protected sendError(res: Response, error: string, statusCode: number = 500): void {
    res.status(statusCode).json({
      success: false,
      error
    });
  }

  protected handleAsync(fn: Function) {
    return (req: Request, res: Response) => {
      Promise.resolve(fn(req, res)).catch((error) => {
        this.log('error', 'Async operation failed', error);
        this.sendError(res, 'Internal server error');
      });
    };
  }
}
