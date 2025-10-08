import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/emr_system';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'emr_system';

// MongoDB connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
};

// Initialize database connection
export async function initializeDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, options);
    logger.info(`Connected to MongoDB database: ${MONGODB_DATABASE}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await closeDatabase();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Get database instance
export function getDatabase(): mongoose.Connection {
  if (!mongoose.connection.readyState) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return mongoose.connection;
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
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

// Export mongoose for use in models
export { mongoose };
