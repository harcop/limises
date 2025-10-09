export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected log(level: 'info' | 'error' | 'warn', message: string, data?: any): void {
    const logMessage = `[${this.serviceName}] ${message}`;
    console.log(`[${level.toUpperCase()}] ${logMessage}`, data || '');
  }

  protected handleError(error: any, context: string): never {
    this.log('error', `${context}: ${error.message}`, error);
    throw error;
  }
}
