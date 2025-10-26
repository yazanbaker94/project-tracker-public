import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { CreateUserRequest, LoginRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const userData: CreateUserRequest = req.body;

  // Check if user already exists
  const existingUser = await UserModel.findByEmail(userData.email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // For now, assign to default organization (ID: 1)
  // In production, you might want organization selection during registration
  const defaultOrganizationId = 1;

  // Create new user
  const user = await UserModel.create(userData, defaultOrganizationId);

  // Generate JWT token with organization_id
  const jwtSecret = process.env.JWT_SECRET || 'default_secret';
  const token = jwt.sign(
    { id: user.id, email: user.email, organization_id: user.organization_id },
    jwtSecret,
    { expiresIn: '7d' }
  );

  const response: ApiResponse = {
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        organization_id: user.organization_id,
        created_at: user.created_at
      },
      token
    }
  };

  res.status(201).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  // Find user by email
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token with organization_id
  const jwtSecret = process.env.JWT_SECRET || 'default_secret';
  const token = jwt.sign(
    { id: user.id, email: user.email, organization_id: user.organization_id },
    jwtSecret,
    { expiresIn: '7d' }
  );

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        organization_id: user.organization_id,
        created_at: user.created_at
      },
      token
    }
  };

  res.status(200).json(response);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Profile retrieved successfully',
    data: { user }
  };

  res.status(200).json(response);
});
