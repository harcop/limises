import { initializeDatabase, closeDatabase } from './connection';
import { logger } from '../utils/logger';

// Import all models to ensure they are registered
import '../models';

async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting MongoDB migration...');
    
    // Initialize database connection
    await initializeDatabase();
    
    logger.info('MongoDB migration completed successfully');
    logger.info('All collections will be created automatically when first document is inserted');
    
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runMigrations };
