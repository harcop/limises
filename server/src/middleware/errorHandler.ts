import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getEnvConfig } from '../utils/env';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code?: string | number;
  errors?: { [key: string]: { message: string } };
}

// Global error handler middleware
export const errorHandler = (err: ErrorWithStatusCode, _req: Request, res: Response, _next: NextFunction): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { name: 'CastError', message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { name: 'DuplicateKeyError', message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map(val => val.message).join(', ');
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { name: 'JsonWebTokenError', message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { name: 'TokenExpiredError', message, statusCode: 401 };
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection error';
    error = { name: 'MongoNetworkError', message, statusCode: 503 };
  }

  if (err.name === 'MongoTimeoutError') {
    const message = 'Database operation timeout';
    error = { name: 'MongoTimeoutError', message, statusCode: 503 };
  }

  if (err.name === 'MongoServerError') {
    const message = 'Database server error';
    error = { name: 'MongoServerError', message, statusCode: 500 };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Too many requests, please try again later';
    error = { name: 'RateLimitError', message, statusCode: 429 };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't leak error details in production
  const config = getEnvConfig();
  const response = {
    success: false,
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};
