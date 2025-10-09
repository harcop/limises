import { Router } from 'express';

export abstract class BaseModule {
  protected router: Router;
  protected moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
    this.router = Router();
    this.initializeRoutes();
  }

  protected abstract initializeRoutes(): void;

  public getRouter(): Router {
    return this.router;
  }

  public getModuleName(): string {
    return this.moduleName;
  }

  protected log(level: 'info' | 'error' | 'warn', message: string, data?: any): void {
    const logMessage = `[${this.moduleName}] ${message}`;
    console.log(`[${level.toUpperCase()}] ${logMessage}`, data || '');
  }
}
