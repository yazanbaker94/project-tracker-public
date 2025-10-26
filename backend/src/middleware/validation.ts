import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateProjectStatus = (status: string): boolean => {
  return ['active', 'completed'].includes(status);
};

export const validateRequired = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { body } = req;

    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
        const response: ApiResponse = {
          success: false,
          message: `Field '${field}' is required`,
          error: 'VALIDATION_ERROR'
        };
        res.status(400).json(response);
        return;
      }
    }

    next();
  };
};

export const validateUserRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, first_name, last_name } = req.body;

  // Check required fields
  if (!email || !password || !first_name || !last_name) {
    const response: ApiResponse = {
      success: false,
      message: 'All fields are required',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  // Validate email format
  if (!validateEmail(email)) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid email format',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  // Validate password strength
  if (!validatePassword(password)) {
    const response: ApiResponse = {
      success: false,
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  // Validate name fields
  if (first_name.trim().length < 2 || last_name.trim().length < 2) {
    const response: ApiResponse = {
      success: false,
      message: 'First and last names must be at least 2 characters',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    const response: ApiResponse = {
      success: false,
      message: 'Email and password are required',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  // Validate email format
  if (!validateEmail(email)) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid email format',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  next();
};

export const validateProject = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, status } = req.body;

  // Check required fields
  if (!title || !description) {
    const response: ApiResponse = {
      success: false,
      message: 'Title and description are required',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  // Validate title length
  if (title.trim().length < 3) {
    const response: ApiResponse = {
      success: false,
      message: 'Title must be at least 3 characters',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  // Validate description length
  if (description.trim().length < 10) {
    const response: ApiResponse = {
      success: false,
      message: 'Description must be at least 10 characters',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  // Validate status if provided
  if (status && !validateProjectStatus(status)) {
    const response: ApiResponse = {
      success: false,
      message: 'Status must be either "active" or "completed"',
      error: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  next();
};
