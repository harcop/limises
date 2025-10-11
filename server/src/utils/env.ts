/**
 * Environment variable validation and management utility
 */

import { logger } from './logger';

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  MONGODB_DATABASE: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: string;
}

class EnvironmentManager {
  private config: EnvConfig;

  constructor() {
    this.config = this.validateAndLoadConfig();
  }

  private validateAndLoadConfig(): EnvConfig {
    const requiredEnvVars = [
      'JWT_SECRET',
      'MONGODB_URI'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return {
      NODE_ENV: this.getEnvVar('NODE_ENV', 'development'),
      PORT: this.getEnvVarAsNumber('PORT', 4001),
      MONGODB_URI: this.getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/emr_system'),
      MONGODB_DATABASE: this.getEnvVar('MONGODB_DATABASE', 'emr_system'),
      JWT_SECRET: this.getEnvVar('JWT_SECRET'),
      JWT_EXPIRES_IN: this.getEnvVar('JWT_EXPIRES_IN', '24h'),
      CORS_ORIGIN: this.getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
      RATE_LIMIT_WINDOW_MS: this.getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 900000),
      RATE_LIMIT_MAX_REQUESTS: this.getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
      LOG_LEVEL: this.getEnvVar('LOG_LEVEL', 'info')
    };
  }

  private getEnvVar(name: string, defaultValue?: string): string {
    const value = process.env[name];
    if (!value && defaultValue === undefined) {
      throw new Error(`Environment variable ${name} is required but not set`);
    }
    return value || defaultValue!;
  }

  private getEnvVarAsNumber(name: string, defaultValue: number): number {
    const value = process.env[name];
    if (!value) return defaultValue;
    
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${name} must be a valid number, got: ${value}`);
    }
    return parsed;
  }

  public getConfig(): EnvConfig {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  public logConfig(): void {
    const safeConfig = {
      ...this.config,
      JWT_SECRET: this.config.JWT_SECRET ? '[REDACTED]' : '[NOT SET]',
      MONGODB_URI: this.config.MONGODB_URI.replace(/\/\/.*@/, '//[REDACTED]@')
    };
    
    logger.info('Environment configuration loaded:', safeConfig);
  }
}

// Create singleton instance
export const env = new EnvironmentManager();

// Export individual config getters for convenience
export const getEnvConfig = () => env.getConfig();
export const isDevelopment = () => env.isDevelopment();
export const isProduction = () => env.isProduction();
export const isTest = () => env.isTest();
