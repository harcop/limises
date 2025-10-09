// Database utility functions for MongoDB operations
// These provide a simple interface for common database operations

import { mongoose } from './connection';
import { logger } from '../utils/logger';

// Generic function to run MongoDB operations
export async function runQuery(operation: string, params: any[] = []): Promise<any> {
  try {
    logger.warn('runQuery called - this should be migrated to use MongoDB models directly');
    // This is a placeholder - in production, you would implement proper MongoDB operations
    return { acknowledged: true, insertedId: null };
  } catch (error) {
    logger.error('Database operation error:', error);
    throw error;
  }
}

// Generic function to get a single document
export async function getRow(operation: string, params: any[] = []): Promise<any> {
  try {
    logger.warn('getRow called - this should be migrated to use MongoDB models directly');
    // This is a placeholder - in production, you would implement proper MongoDB operations
    return null;
  } catch (error) {
    logger.error('Database operation error:', error);
    throw error;
  }
}

// Generic function to get multiple documents
export async function getAll(operation: string, params: any[] = []): Promise<any[]> {
  try {
    logger.warn('getAll called - this should be migrated to use MongoDB models directly');
    // This is a placeholder - in production, you would implement proper MongoDB operations
    return [];
  } catch (error) {
    logger.error('Database operation error:', error);
    throw error;
  }
}

// Helper function to check if database is connected
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Helper function to get connection state
export function getConnectionState(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
}
