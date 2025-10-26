import api from './api';
import { IngestionJob, CreateIngestionJobRequest } from '../types';

const ingestionService = {
  // Initialize file upload
  async initUpload(data: CreateIngestionJobRequest) {
    const response = await api.post<{
      success: boolean;
      data: {
        job_id: string;
        upload_url: string;
        status: string;
        expires_at: string;
      };
    }>('/ingest/init', data);
    return response.data;
  },

  // Get job status by job_id
  async getJobStatus(jobId: string) {
    const response = await api.get<{
      success: boolean;
      data: { job: IngestionJob };
    }>(`/ingest/status/${jobId}`);
    return response.data;
  },

  // Get all user's jobs
  async getUserJobs() {
    const response = await api.get<{
      success: boolean;
      data: { jobs: IngestionJob[]; count: number };
    }>('/ingest/jobs');
    return response.data;
  },

  // Get all organization jobs
  async getOrganizationJobs() {
    const response = await api.get<{
      success: boolean;
      data: { jobs: IngestionJob[]; count: number };
    }>('/ingest/jobs/all');
    return response.data;
  },

  // Get ingestion statistics
  async getStats() {
    const response = await api.get<{
      success: boolean;
      data: {
        stats: {
          total: number;
          pending: number;
          processing: number;
          completed: number;
          failed: number;
        };
      };
    }>('/ingest/stats');
    return response.data;
  },

  // Delete a job
  async deleteJob(jobId: string) {
    const response = await api.delete(`/ingest/${jobId}`);
    return response.data;
  },
};

export default ingestionService;

