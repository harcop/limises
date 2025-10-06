import fs from 'fs';
import path from 'path';
import { initializeDatabase, runQuery, closeDatabase } from './connection';
import { logger } from '../utils/logger';

async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migration...');
    
    // Initialize database connection
    await initializeDatabase();
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    logger.info(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await runQuery(statement);
          logger.info(`Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          logger.error(`Error executing statement ${i + 1}:`, error);
          logger.error(`Statement: ${statement}`);
          throw error;
        }
      }
    }
    
    logger.info('Database migration completed successfully');
    
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
