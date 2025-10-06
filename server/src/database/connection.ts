import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { DatabaseRow, DatabaseResult } from '../types';

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database/emr_system.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: sqlite3.Database | null = null;

// Initialize database connection
export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.error('Error opening database:', err);
        reject(err);
      } else {
        logger.info('Connected to SQLite database');
        
        // Enable foreign keys
        db!.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            logger.error('Error enabling foreign keys:', err);
            reject(err);
          } else {
            logger.info('Foreign keys enabled');
            resolve();
          }
        });
      }
    });
  });
}

// Get database instance
export function getDatabase(): sqlite3.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

// Execute a query with parameters
export function runQuery(sql: string, params: any[] = []): Promise<DatabaseResult> {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function(err) {
      if (err) {
        logger.error('Database query error:', err);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Get a single row
export function getRow(sql: string, params: any[] = []): Promise<DatabaseRow | undefined> {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) {
        logger.error('Database query error:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Get all rows
export function getAll(sql: string, params: any[] = []): Promise<DatabaseRow[]> {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) {
        logger.error('Database query error:', err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

// Begin transaction
export function beginTransaction(): Promise<DatabaseResult> {
  return runQuery('BEGIN TRANSACTION');
}

// Commit transaction
export function commitTransaction(): Promise<DatabaseResult> {
  return runQuery('COMMIT');
}

// Rollback transaction
export function rollbackTransaction(): Promise<DatabaseResult> {
  return runQuery('ROLLBACK');
}

// Close database connection
export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
          reject(err);
        } else {
          logger.info('Database connection closed');
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}
