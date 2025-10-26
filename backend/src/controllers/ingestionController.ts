import { Request, Response } from 'express';
import { IngestionJobModel } from '../models/IngestionJob';
import { CreateIngestionJobRequest, UpdateIngestionJobRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Mock processing function - simulates async file processing
const simulateProcessing = async (jobId: string) => {
  // Wait 5-10 seconds to simulate processing
  const processingTime = 5000 + Math.random() * 5000;
  
  await new Promise(resolve => setTimeout(resolve, processingTime));

  // Update job to processing first
  await IngestionJobModel.update(jobId, { status: 'processing' });
  
  // Wait a bit more
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 90% success rate, 10% failure
  const success = Math.random() > 0.1;

  if (success) {
    // Mock result data
    const mockResult = {
      rows_processed: Math.floor(Math.random() * 10000) + 100,
      columns: Math.floor(Math.random() * 20) + 5,
      processing_time_ms: processingTime + 2000,
      summary: 'File processed successfully',
      data_preview: [
        { id: 1, name: 'Sample Data 1', value: 123 },
        { id: 2, name: 'Sample Data 2', value: 456 },
        { id: 3, name: 'Sample Data 3', value: 789 }
      ]
    };

    await IngestionJobModel.update(jobId, {
      status: 'completed',
      result_url: `https://mock-storage.example.com/results/${jobId}.json`,
      result_data: mockResult
    });

    console.log(`✅ Job ${jobId} completed successfully`);
  } else {
    await IngestionJobModel.update(jobId, {
      status: 'failed',
      error_message: 'Mock error: File format invalid or corrupted'
    });

    console.log(`❌ Job ${jobId} failed`);
  }
};

// POST /api/ingest/init - Initialize file upload
export const initUpload = asyncHandler(async (req: Request, res: Response) => {
  const jobData: CreateIngestionJobRequest = req.body;
  const userId = (req as any).user.id;
  const organizationId = (req as any).user.organization_id;

  // Validate file type
  const allowedTypes = ['csv', 'json', 'xml', 'pdf', 'xlsx', 'txt', 'log'];
  if (!allowedTypes.includes(jobData.file_type.toLowerCase())) {
    throw new AppError(`File type '${jobData.file_type}' not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400);
  }

  // Create job
  const job = await IngestionJobModel.create(jobData, userId, organizationId);

  // Start mock processing in background (don't await)
  simulateProcessing(job.job_id).catch(err => {
    console.error(`Error processing job ${job.job_id}:`, err);
  });

  const response: ApiResponse = {
    success: true,
    message: 'Upload initiated successfully',
    data: {
      job_id: job.job_id,
      upload_url: job.upload_url,
      status: job.status,
      expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
    }
  };

  res.status(201).json(response);
});

// GET /api/ingest/status/:jobId - Get job status
export const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const organizationId = (req as any).user.organization_id;

  const job = await IngestionJobModel.findByJobId(jobId, organizationId);

  if (!job) {
    throw new AppError('Job not found or you do not have permission to access it', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Job status retrieved successfully',
    data: { job }
  };

  res.status(200).json(response);
});

// GET /api/ingest/jobs - Get all jobs for current user
export const getUserJobs = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const organizationId = (req as any).user.organization_id;

  const jobs = await IngestionJobModel.findByUserId(userId, organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Jobs retrieved successfully',
    data: { jobs, count: jobs.length }
  };

  res.status(200).json(response);
});

// GET /api/ingest/jobs/all - Get all jobs for organization
export const getOrganizationJobs = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = (req as any).user.organization_id;

  const jobs = await IngestionJobModel.findByOrganizationId(organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Organization jobs retrieved successfully',
    data: { jobs, count: jobs.length }
  };

  res.status(200).json(response);
});

// GET /api/ingest/stats - Get ingestion statistics
export const getIngestionStats = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = (req as any).user.organization_id;

  const stats = await IngestionJobModel.getStatsByOrganizationId(organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Ingestion statistics retrieved successfully',
    data: { stats }
  };

  res.status(200).json(response);
});

// POST /api/pipeline/callback - Webhook callback (simulates external service)
export const pipelineCallback = asyncHandler(async (req: Request, res: Response) => {
  const { job_id, status, result_url, result_data, error_message } = req.body;

  if (!job_id || !status) {
    throw new AppError('job_id and status are required', 400);
  }

  // Find job (no org check for callback)
  const job = await IngestionJobModel.findByJobIdGlobal(job_id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  // Update job
  const updateData: UpdateIngestionJobRequest = { status };
  
  if (result_url) updateData.result_url = result_url;
  if (result_data) updateData.result_data = result_data;
  if (error_message) updateData.error_message = error_message;

  await IngestionJobModel.update(job_id, updateData);

  const response: ApiResponse = {
    success: true,
    message: 'Job status updated successfully'
  };

  res.status(200).json(response);
});

// DELETE /api/ingest/:jobId - Delete a job
export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const organizationId = (req as any).user.organization_id;

  const deleted = await IngestionJobModel.delete(jobId, organizationId);

  if (!deleted) {
    throw new AppError('Job not found or you do not have permission to delete it', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Job deleted successfully'
  };

  res.status(200).json(response);
});

