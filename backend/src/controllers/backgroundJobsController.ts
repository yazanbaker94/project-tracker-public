import { Request, Response } from 'express';
import { BackgroundJobModel } from '../models/BackgroundJob';
import { ProjectModel } from '../models/Project';
import { CreateBackgroundJobRequest, UpdateBackgroundJobRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Mock function to recompute analytics
const recomputeAnalytics = async (jobId: string, organizationId: number) => {
  try {
    // Step 1: Start job
    await BackgroundJobModel.update(jobId, {
      status: 'running',
      progress_percentage: 0,
      current_step: 'Initializing analytics recalculation...'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Recalculate project stats
    await BackgroundJobModel.update(jobId, {
      progress_percentage: 25,
      current_step: 'Recalculating project statistics...'
    });

    const orgStats = await ProjectModel.getStatsByOrganizationId(organizationId);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Update completion times
    await BackgroundJobModel.update(jobId, {
      progress_percentage: 50,
      current_step: 'Updating completion time metrics...'
    });

    const avgCompletionTime = await ProjectModel.getAverageCompletionTime(organizationId);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 4: Refresh detailed analytics
    await BackgroundJobModel.update(jobId, {
      progress_percentage: 75,
      current_step: 'Refreshing detailed analytics...'
    });

    const detailedAnalytics = await ProjectModel.getDetailedAnalytics(organizationId);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 5: Complete
    await BackgroundJobModel.update(jobId, {
      status: 'completed',
      progress_percentage: 100,
      current_step: 'Analytics recalculation complete',
      result_data: {
        organization_stats: orgStats,
        average_completion_time: avgCompletionTime,
        detailed_analytics: detailedAnalytics,
        recalculated_at: new Date().toISOString(),
        metrics_updated: [
          'project_counts',
          'completion_rates',
          'average_completion_time',
          'user_statistics',
          'organization_overview'
        ]
      }
    });

    console.log(`✅ Analytics recalculation completed for job ${jobId}`);
  } catch (error) {
    console.error(`❌ Analytics recalculation failed for job ${jobId}:`, error);
    
    await BackgroundJobModel.update(jobId, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

// POST /api/jobs/recompute-metrics - Trigger analytics recalculation
export const recomputeMetrics = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const organizationId = (req as any).user.organization_id;

  const jobData: CreateBackgroundJobRequest = {
    job_type: 'recompute_analytics',
    options: req.body.options || {}
  };

  // Create job
  const job = await BackgroundJobModel.create(jobData, userId, organizationId);

  // Start processing in background (don't await)
  recomputeAnalytics(job.job_id, organizationId).catch(err => {
    console.error(`Error in recomputeAnalytics for job ${job.job_id}:`, err);
  });

  const response: ApiResponse = {
    success: true,
    message: 'Analytics recalculation started',
    data: {
      job_id: job.job_id,
      status: job.status,
      estimated_time_seconds: job.estimated_time_seconds,
      created_at: job.created_at
    }
  };

  res.status(201).json(response);
});

// GET /api/jobs/status/:jobId - Get job status
export const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const organizationId = (req as any).user.organization_id;

  const job = await BackgroundJobModel.findByJobId(jobId, organizationId);

  if (!job) {
    throw new AppError('Job not found or you do not have permission to access it', 404);
  }

  // Calculate elapsed time
  const elapsedTime = job.started_at 
    ? Math.floor((new Date().getTime() - new Date(job.started_at).getTime()) / 1000)
    : 0;

  const response: ApiResponse = {
    success: true,
    message: 'Job status retrieved successfully',
    data: {
      job,
      elapsed_time_seconds: elapsedTime
    }
  };

  res.status(200).json(response);
});

// GET /api/jobs - List background jobs
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = (req as any).user.organization_id;
  const limit = parseInt(req.query.limit as string) || 50;

  const jobs = await BackgroundJobModel.findByOrganizationId(organizationId, limit);

  const response: ApiResponse = {
    success: true,
    message: 'Background jobs retrieved successfully',
    data: {
      jobs,
      count: jobs.length
    }
  };

  res.status(200).json(response);
});

// GET /api/jobs/stats - Get job statistics
export const getJobStats = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = (req as any).user.organization_id;

  const stats = await BackgroundJobModel.getStatsByOrganizationId(organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Job statistics retrieved successfully',
    data: { stats }
  };

  res.status(200).json(response);
});

// DELETE /api/jobs/:jobId - Delete a job
export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const organizationId = (req as any).user.organization_id;

  // Check if job exists and is not running
  const job = await BackgroundJobModel.findByJobId(jobId, organizationId);
  
  if (!job) {
    throw new AppError('Job not found or you do not have permission to delete it', 404);
  }

  if (job.status === 'running') {
    throw new AppError('Cannot delete a job that is currently running', 400);
  }

  const deleted = await BackgroundJobModel.delete(jobId, organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Job deleted successfully'
  };

  res.status(200).json(response);
});

