import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code?: string;
  errors?: { [key: string]: { message: string } };
}

// Global error handler middleware
export const errorHandler = (err: ErrorWithStatusCode, req: Request, res: Response, next: NextFunction): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection error';
    error = { message, statusCode: 503 };
  }

  if (err.name === 'MongoTimeoutError') {
    const message = 'Database operation timeout';
    error = { message, statusCode: 503 };
  }

  if (err.name === 'MongoServerError') {
    const message = 'Database server error';
    error = { message, statusCode: 500 };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't leak error details in production
  const response = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};
