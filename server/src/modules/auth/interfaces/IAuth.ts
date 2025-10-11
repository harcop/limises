import { Request } from 'express';

// ==============================================
// AUTHENTICATION INTERFACES
// ==============================================

// Base authentication interface
export interface BaseAuth {
  authId: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt?: string;
}

// Staff authentication
export interface StaffAuth extends BaseAuth {
  staffId: string;
  username: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

// Authentication request types
export interface StaffAuthRequest extends Request {
  user?: {
    authId: string;
    staffId: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

// Generic AuthRequest for backward compatibility
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    staffId: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    position?: string;
    roles: string[];
    permissions: string[];
  };
}

// JWT Types
export interface JWTPayload {
  userId?: string;
  authId?: string;
  staffId?: string;
  username: string;
  roles: string[];
  userType?: string;
  iat: number;
  exp: number;
}
