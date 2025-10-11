import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { initializeDatabase } from './database/connection';
import { getEnvConfig } from './utils/env';

// Import route modules
import staffAuthRoutes from './routes/staffAuth';
import clinicalEnhancedRoutes from './routes/clinicalEnhanced';
import { ModuleManager } from './modules/ModuleManager';

// Load environment variables
dotenv.config();

const app = express();
const config = getEnvConfig();
const PORT = config.PORT;

// Initialize module manager
const moduleManager = new ModuleManager();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Roles']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: config.RATE_LIMIT_MAX_REQUESTS, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV
  });
});

// API routes
app.use('/api/staff/auth', staffAuthRoutes);
app.use('/api/clinical-enhanced', clinicalEnhancedRoutes);
// Use modular routes (includes ALL modules: patients, appointments, clinical, staff, billing, inventory, pharmacy, laboratory, opd, ipd, emergency, ot, radiology, hr, integration, reports)
app.use(moduleManager.getModuleRouter());

// API documentation endpoint
app.get('/api', (_req, res) => {
  const moduleInfo = moduleManager.getModuleInfo();
  const endpoints = moduleInfo.reduce((acc, module) => {
    acc[module.name] = module.path;
    return acc;
  }, {} as Record<string, string>);

  res.json({
    message: 'Hospital Management System API',
    version: '1.0.0',
    architecture: 'Modular (NestJS-style)',
    modules: moduleInfo,
    endpoints: {
      ...endpoints,
      // Additional endpoints (not yet migrated to modules)
      staffAuth: '/api/staff/auth',
      clinicalEnhanced: '/api/clinical-enhanced',
      opd: '/api/opd',
      ipd: '/api/ipd',
      laboratory: '/api/lab',
      pharmacy: '/api/pharmacy',
      billing: '/api/billing',
      reports: '/api/reports',
      emergency: '/api/emergency',
      operationTheatre: '/api/ot',
      radiology: '/api/radiology',
      humanResources: '/api/hr',
      systemIntegration: '/api/integration'
    },
    documentation: '/api/integration/docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
    availableEndpoints: '/api'
  });
});

// Global error handler
app.use(errorHandler);

// Initialize database and start server
async function startServer(): Promise<void> {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully');
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

export default app;
