import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { logger, stream } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { initializeDatabase } from './database/connection';

// Import route modules
import staffAuthRoutes from './routes/staffAuth';
import patientRoutes from './routes/patients';
import appointmentRoutes from './routes/appointments';
import clinicalRoutes from './routes/clinical';
import clinicalEnhancedRoutes from './routes/clinicalEnhanced';
import securityAuditRoutes from './routes/securityAudit';
import opdRoutes from './routes/opd';
import ipdRoutes from './routes/ipd';
import labRoutes from './routes/laboratory';
import pharmacyRoutes from './routes/pharmacy';
import billingRoutes from './routes/billing';
import staffRoutes from './routes/staff';
import inventoryRoutes from './routes/inventory';
import reportsRoutes from './routes/reports';
import emergencyRoutes from './routes/emergency';
import operationTheatreRoutes from './routes/operationTheatre';
import radiologyRoutes from './routes/radiology';
import humanResourcesRoutes from './routes/humanResources';
import systemIntegrationRoutes from './routes/systemIntegration';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Roles']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
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
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/staff/auth', staffAuthRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/clinical-enhanced', clinicalEnhancedRoutes);
app.use('/api/security', securityAuditRoutes);
app.use('/api/opd', opdRoutes);
app.use('/api/ipd', ipdRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ot', operationTheatreRoutes);
app.use('/api/radiology', radiologyRoutes);
app.use('/api/hr', humanResourcesRoutes);
app.use('/api/integration', systemIntegrationRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Hospital Management System API',
    version: '1.0.0',
    endpoints: {
      staffAuth: '/api/staff/auth',
      patients: '/api/patients',
      appointments: '/api/appointments',
      clinical: '/api/clinical',
      opd: '/api/opd',
      ipd: '/api/ipd',
      laboratory: '/api/lab',
      pharmacy: '/api/pharmacy',
      billing: '/api/billing',
      staff: '/api/staff',
      inventory: '/api/inventory',
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
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
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
