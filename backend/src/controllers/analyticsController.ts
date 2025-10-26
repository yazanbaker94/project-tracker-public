import { Request, Response } from 'express';
import { ProjectModel } from '../models/Project';
import { ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Get organization-wide analytics
export const getOrganizationAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = (req as any).user.organization_id;

  const analytics = await ProjectModel.getDetailedAnalytics(organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Organization analytics retrieved successfully',
    data: { analytics }
  };

  res.status(200).json(response);
});

// Get per-user statistics
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const organizationId = (req as any).user.organization_id;

  const stats = await ProjectModel.getStatsByUserId(userId, organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'User statistics retrieved successfully',
    data: { stats }
  };

  res.status(200).json(response);
});

// Get average completion time
export const getCompletionTime = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = (req as any).user.organization_id;

  const avgDays = await ProjectModel.getAverageCompletionTime(organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Average completion time retrieved successfully',
    data: { 
      average_completion_days: avgDays,
      average_completion_hours: avgDays ? (avgDays * 24).toFixed(1) : null
    }
  };

  res.status(200).json(response);
});

// Get comprehensive analytics dashboard data
export const getAnalyticsDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const organizationId = (req as any).user.organization_id;

  // Fetch all analytics data in parallel
  const [orgStats, userStats, avgCompletionTime, detailedAnalytics] = await Promise.all([
    ProjectModel.getStatsByOrganizationId(organizationId),
    ProjectModel.getStatsByUserId(userId, organizationId),
    ProjectModel.getAverageCompletionTime(organizationId),
    ProjectModel.getDetailedAnalytics(organizationId)
  ]);

  const response: ApiResponse = {
    success: true,
    message: 'Analytics dashboard data retrieved successfully',
    data: {
      organization_stats: orgStats,
      user_stats: userStats,
      average_completion_time: {
        days: avgCompletionTime,
        hours: avgCompletionTime ? (avgCompletionTime * 24).toFixed(1) : null
      },
      detailed_analytics: detailedAnalytics
    }
  };

  res.status(200).json(response);
});

