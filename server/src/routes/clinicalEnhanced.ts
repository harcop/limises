import express, { Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Health check endpoint
router.get('/health', (_, res: Response) => {
  res.json({
    success: true,
    message: 'Clinical Enhanced module is active',
    module: 'ClinicalEnhanced',
    timestamp: new Date().toISOString()
  });
});

// Enhanced clinical routes - placeholder for now
router.get('/', (_, res: Response) => {
  res.json({
    success: true,
    message: 'Clinical Enhanced routes are active',
    endpoints: [
      'GET /health - Health check',
      'GET / - Module info'
    ]
  });
});

// Placeholder for enhanced clinical features
router.get('/enhanced-features', authorize('doctor', 'admin'), (_, res: Response) => {
  res.json({
    success: true,
    message: 'Enhanced clinical features endpoint',
    features: [
      'Advanced clinical decision support',
      'Enhanced patient monitoring',
      'Clinical analytics',
      'Evidence-based recommendations'
    ]
  });
});

export default router;
