import api from './api';
import { BackgroundJob } from '../types';

const backgroundJobsService = {
  // Trigger analytics recalculation
  async recomputeMetrics(options?: any) {
    const response = await api.post<{
      success: boolean;
      data: {
        job_id: string;
        status: string;
        estimated_time_seconds: number;
        created_at: string;
      };
    }>('/jobs/recompute-metrics', { options });
    return response.data;
  },

  // Get job status by job_id
  async getJobStatus(jobId: string) {
    const response = await api.get<{
      success: boolean;
      data: {
        job: BackgroundJob;
        elapsed_time_seconds: number;
      };
    }>(`/jobs/status/${jobId}`);
    return response.data;
  },

  // Get all background jobs
  async getJobs(limit?: number) {
    const response = await api.get<{
      success: boolean;
      data: {
        jobs: BackgroundJob[];
        count: number;
      };
    }>('/jobs', { params: { limit } });
    return response.data;
  },

  // Get job statistics
  async getJobStats() {
    const response = await api.get<{
      success: boolean;
      data: {
        stats: {
          total: number;
          queued: number;
          running: number;
          completed: number;
          failed: number;
        };
      };
    }>('/jobs/stats');
    return response.data;
  },

  // Delete a job
  async deleteJob(jobId: string) {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },
};

export default backgroundJobsService;

